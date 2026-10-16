package app.yewebview

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.content.res.Configuration
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.webkit.*
import androidx.activity.BackEventCompat
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback

/**
 * WebView-обёртка приложения (по образцу yeplayer). Весь UI — с сервера пользователя (адрес в prefs "server").
 * Первый запуск / ошибка загрузки / ярлык «Server address» (долгое нажатие на иконку) → assets/setup.html.
 * Инсеты системных баров → CSS --ye-inset-top/--ye-inset-bottom (контракт ye-design-system) (+ left/right); тема — системная (prefers-color-scheme в WebView,
 * иконки баров по uiMode); выбор файлов — системный пикер (multiple, image/video); Back → window.yeBack() → history → выход.
 */
class MainActivity : ComponentActivity() {
    private lateinit var web: WebView
    private val prefs by lazy { getSharedPreferences("yewebview", MODE_PRIVATE) }
    private var insetsJs = ""
    private var chooser: ValueCallback<Array<Uri>>? = null
    // saved address wins; else the build-time default (-PyeServer=http://t470:8790); else setup screen
    private val server get() = prefs.getString("server", null) ?: getString(R.string.default_server).ifBlank { null }

    companion object { const val PICK = 1; const val SETUP = "file:///android_asset/setup.html" }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // System Back on every API level (gesture, button, predictive back) via one OnBackPressedDispatcher callback.
        // Page contract: window.yeBack() closes the top overlay (sheet/menu/full-screen player) or pops the route stack and
        // returns true; window.yeBackProgress(p, edge) optionally animates the predictive gesture. Only "visible" overlays
        // may count — closed ones that stay mounted must not swallow Back (yeplayer bug 2026-10-15).
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackStarted(e: BackEventCompat) = progress(0f, e.swipeEdge)
            override fun handleOnBackProgressed(e: BackEventCompat) = progress(e.progress, e.swipeEdge)
            override fun handleOnBackCancelled() { web.evaluateJavascript("window.yeBackProgress&&window.yeBackProgress(0,'cancel')", null) }
            override fun handleOnBackPressed() = goBack()
        })
        window.statusBarColor = Color.TRANSPARENT
        window.navigationBarColor = Color.TRANSPARENT
        if (Build.VERSION.SDK_INT >= 29) { window.isNavigationBarContrastEnforced = false; window.isStatusBarContrastEnforced = false }
        @Suppress("DEPRECATION")
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LAYOUT_STABLE or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        web = WebView(this)
        web.setBackgroundColor(if (dark()) Color.BLACK else Color.WHITE)
        setContentView(web)
        barIcons()
        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = true // только для assets/setup.html
            if (Build.VERSION.SDK_INT >= 33) isAlgorithmicDarkeningAllowed = false // тёмную тему рисует сам сайт
        }
        web.addJavascriptInterface(Setup(), "YeSetup")
        web.webViewClient = Client()
        web.webChromeClient = Chrome()
        web.setOnApplyWindowInsetsListener { v, ins ->
            val d = resources.displayMetrics.density
            val b = ins.getInsets(WindowInsets.Type.systemBars() or WindowInsets.Type.displayCutout())
            fun px(n: Int) = "${(n / d).toInt()}px"
            insetsJs = "(function(){var s=document.documentElement.style;s.setProperty('--ye-inset-top','${px(b.top)}');s.setProperty('--ye-inset-bottom','${px(b.bottom)}');" +
                "s.setProperty('--ye-inset-left','${px(b.left)}');s.setProperty('--ye-inset-right','${px(b.right)}')})()"
            web.evaluateJavascript(insetsJs, null)
            v.onApplyWindowInsets(ins)
        }
        open(intent)
    }

    override fun onNewIntent(i: Intent) { super.onNewIntent(i); open(i) }

    private fun open(i: Intent?) {
        val s = server
        if (s == null || i?.action == "app.yewebview.SETUP") web.loadUrl(SETUP) else web.loadUrl(s)
    }

    private fun dark() = (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES

    /** Тёмные иконки статус/навбара в светлой теме, светлые — в тёмной. */
    private fun barIcons() {
        if (Build.VERSION.SDK_INT >= 30) {
            val m = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS or WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
            window.insetsController?.setSystemBarsAppearance(if (dark()) 0 else m, m)
        }
    }

    override fun onConfigurationChanged(c: Configuration) { super.onConfigurationChanged(c); barIcons() }

    private fun progress(p: Float, edge: Int) =
        web.evaluateJavascript("window.yeBackProgress&&window.yeBackProgress($p,'${if (edge == BackEventCompat.EDGE_LEFT) "left" else "right"}')", null)

    /** page (window.yeBack) → WebView history → leave the app on the root screen */
    fun goBack() {
        web.evaluateJavascript("(function(){try{return !!(window.yeBack&&window.yeBack())}catch(e){return false}})()") { r ->
            if (r != "true") { if (web.canGoBack()) web.goBack() else finish() }
        }
    }


    inner class Setup {
        @JavascriptInterface fun current(): String = server ?: ""
        @JavascriptInterface fun save(url: String) {
            val u = url.trim().let { if (it.endsWith("/")) it else "$it/" }
            prefs.edit().putString("server", u).apply()
            runOnUiThread { web.clearHistory(); web.loadUrl(u) }
        }
    }

    inner class Client : WebViewClient() {
        override fun onPageFinished(view: WebView, url: String?) {
            if (insetsJs.isNotEmpty()) view.evaluateJavascript(insetsJs, null)
            if (url == SETUP || url?.startsWith("$SETUP?") == true) view.clearHistory()
        }
        override fun onPageStarted(view: WebView, url: String?, favicon: android.graphics.Bitmap?) {
            if (insetsJs.isNotEmpty()) view.evaluateJavascript(insetsJs, null)
        }
        override fun onReceivedError(view: WebView, req: WebResourceRequest, err: WebResourceError) {
            if (req.isForMainFrame && !req.url.toString().startsWith("file:"))
                view.loadUrl("$SETUP?err=" + Uri.encode(err.description.toString()) + "&url=" + Uri.encode(req.url.toString()))
        }
        // ссылки на другие хосты — во внешний браузер; свой сервер — внутри
        override fun shouldOverrideUrlLoading(view: WebView, req: WebResourceRequest): Boolean {
            val s = server?.let { Uri.parse(it) } ?: return false
            val u = req.url
            if (u.scheme == "file" || (u.host == s.host && u.port == s.port)) return false
            runCatching { startActivity(Intent(Intent.ACTION_VIEW, u)) }
            return true
        }
    }

    inner class Chrome : WebChromeClient() {
        override fun onShowFileChooser(w: WebView, cb: ValueCallback<Array<Uri>>, p: FileChooserParams): Boolean {
            chooser?.onReceiveValue(null); chooser = cb
            val i = Intent(Intent.ACTION_GET_CONTENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*")
                .putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/*", "video/*"))
                .putExtra(Intent.EXTRA_ALLOW_MULTIPLE, p.mode == FileChooserParams.MODE_OPEN_MULTIPLE)
            return try { startActivityForResult(Intent.createChooser(i, "Add photos"), PICK); true } catch (_: Exception) { chooser = null; false }
        }
    }

    @Deprecated("simple and enough here")
    override fun onActivityResult(req: Int, res: Int, data: Intent?) {
        if (req != PICK) return super.onActivityResult(req, res, data)
        val cb = chooser ?: return; chooser = null
        if (res != RESULT_OK || data == null) return cb.onReceiveValue(null)
        val clip = data.clipData
        val uris = if (clip != null) Array(clip.itemCount) { clip.getItemAt(it).uri } else data.data?.let { arrayOf(it) }
        cb.onReceiveValue(uris)
    }
}
