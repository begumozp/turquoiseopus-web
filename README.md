# Turquoise Opus — kurulum ve kullanım

Begüm Özpay’ın onaylı Turquoise Opus tasarımı, tek yöneticili içerik paneli ve özel görsel deposu. Yönetici ve iletişim adresi **info@turquoiseopus.art**. Satın alma Etsy’de tamamlanır. Otomatik çeviri, sepet ve site içi ödeme yoktur.

**İlk kurulumda bütün fotoğraflar halka kapalıdır.** Kaydetmek, yayımlamak veya eski içerik sürümüne dönmek bu kilidi açmaz. Görselleri yalnız Ayarlar ekranında mühendis onayını teyit ederek açın. `dist/` içinde eser, detay veya portre dosyası bulunmaz.

## Teslim edilenler

- Bu kaynak paketi: `public/`, `server/`, `functions/`, `supabase/`, `scripts/`, `tests/`, `seed/` ve belgeler.
- Ayrı özel görsel paketleri: `Turquoise_Opus_Private_Media_1.zip`, `_2.zip`, `_3.zip`. Bunlar **GitHub’a veya public klasörüne yüklenmez**. Üçü aynı `private-media/` klasörüne açılır; aktarım aracı hepsini otomatik bağlar.
- 40 farklı eser kaydı; 23 eserin onaylı web görselleri. 008→007 ve 012→011 alternatif çekimdir, ayrı eser değildir. QC’de düzenlenmiş masterı bulunan 24 farklı eserden WB014’ün renk/yeniden çekim beklemesi korunur.
- 95 fotoğraf: 23 ana görsel, 69 detay, 2 ana sayfa yakın planı, 1 portre. Dosyalar yeniden renklendirilmedi veya yeniden sıkıştırılmadı; mevcut filigranları korunur. EXIF bulunan dosya yoktur. Uzun kenarlar en fazla 2000 px.
- Fotoğrafı onaysız diğer 17 eser veri olarak saklanır; ziyaretçiye eser sayfası veya kart olarak sunulmaz. All of Us ve Process başlangıçta gizlidir.

QC Sheet ve Drive bu teslimatta değiştirilmedi. Kaynak veriler 19.10.2026 tarihli QC okuması ve son onaylı önizlemedir. `seed/content.json` başlangıç içeriğidir; daha sonraki yönetim paneli değişiklikleri Supabase’de tutulur. Kod güncellemesi panel verilerini sıfırlamaz.

## 1. GitHub’a yerleştirme

Kaynak ZIP’i açın ve içindeki dosyaları `begumozp/turquoiseopus-web` deposunun köküne koyun. Yalnız Markdown dosyasını veya yalnız `dist/` klasörünü yüklemek yeterli değildir. Gizli adla başlayan `.github/`, `.gitignore` ve `.env.example` dosyalarını da alın.

Eski depoda yalnız örnek tasarımlı `index.html` vardı. Bu pakette kökteki dosya kurulum açıklamasıdır; gerçek site `public/` kaynaklarından üretilir. Önizleme ve yönetim için **GitHub Pages kullanmayın**: sunucu fonksiyonlarını ve gizli görsel denetimini çalıştırmaz.

Node.js 22 veya üstü ile:

```bash
npm run qa
```

Uygulamanın normal çalışması için üçüncü taraf Node paketi kurulması gerekmez. Tarayıcı QA aracı isteğe bağlıdır ve ayrıca kurulur.

## 2. Supabase Free projesi

1. Kendi hesabınızla yeni bir Supabase projesi açın. Uygun bir AB bölgesini seçin.
2. SQL Editor’da `supabase/schema.sql` dosyasını çalıştırın. Şema taze proje içindir; mevcut başka uygulamanın veritabanında kullanmayın.
3. Auth ayarlarında **yeni kullanıcı kaydını kapatın**. Auth → Users altında `info@turquoiseopus.art` için tek kullanıcıyı oluşturun; güçlü şifre belirleyin ve e-posta doğrulamasını tamamlayın/oluşturma sırasında onaylayın. Buraya verilen parola örnek veya kod içine gömülü değildir.
4. Bu kullanıcının UUID’sini `ADMIN_USER_ID` için kopyalayın. Yalnız e-posta eşleşmesi yeterli sayılmaz; sunucu UUID’yi de kontrol eder.
5. Project URL, publishable/anon key ve **server-only service_role key** değerlerini alın. Service_role anahtarını hiçbir frontend dosyasına, GitHub’a veya ekran görüntüsüne koymayın.
6. Storage’daki `opus-private` kovasının **Private** olduğunu doğrulayın. `anon` veya `authenticated` için public SELECT/download politikası eklemeyin. Dosyalar yalnız sunucu proxy’sinden açılır.

Tablolarda RLS açık, anon/authenticated doğrudan erişimi kapalıdır. RPC’leri yalnız service_role çalıştırabilir. Admin hesabının parolası bu SQL’e yazılmaz.

## 3. Cloudflare Pages

1. Cloudflare → Workers & Pages → Pages üzerinden mevcut GitHub deposunu bağlayın.
2. Framework: None. Build command: **`npm run build`**. Build output: **`dist`**. Root directory: deponun kökü. Build ortamında `NODE_VERSION=22` kullanın.
3. Variables/Secrets alanına `.env.example` dosyasındaki değerleri girin. En az şu beş değer gereklidir:

| Ad | Değer |
|---|---|
| `SUPABASE_URL` | Proje URL’si |
| `SUPABASE_ANON_KEY` | Publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yalnız sunucu secret’ı |
| `ADMIN_USER_ID` | Tek yönetici UUID’si |
| `ADMIN_EMAIL` | `info@turquoiseopus.art` |

4. Deploy edin. Henüz içerik/görseller aktarılmadıysa stüdyo hazırlanıyor mesajı görünmesi normaldir; sistem görselleri açarak hata telafi etmez.
5. `/api/config` 200, `/api/public` 200, oturumsuz `/api/state` 401 dönmeli. `/admin` veya `/admin.html` yönetim girişidir. HTTPS zorunludur.
6. İstediğiniz alan adını Pages → Custom domains üzerinden bağlayın; DNS kayıtlarını Cloudflare’ın gösterdiği değerlerle güncelleyin. E-posta MX kayıtlarını değiştirmeyin.
7. `/api/*` için Cache Everything, public CDN cache, service worker/offline image cache veya benzeri bir kural eklemeyin. API ve görseller `no-store` döner. Rocket Loader gibi script yeniden yazan özellikleri kapalı tutun.

Production ve ayrı bir staging ortamı kullanıyorsanız ayrı Supabase projeleri/secret’ları kullanın. Staging’in üretim verisini değiştirmesine izin vermeyin. Cloudflare erişim ayarları bu kod tarafından değiştirilmez.

## 4. Fotoğrafları tek tek yüklemeden ilk aktarım

Medya ZIP’lerini **depo dışında**, aynı `private-media/` klasörüne açın. Klasörde `manifest.json` ve 95 fotoğraf bulunmalı. Kaynak deposunun içinde terminal açın.

Bash örneği (macOS’ta önce `bash` komutuyla açın); şifreyi komuta düz metin olarak yazmayın:

```bash
export OPUS_SITE='https://SIZIN-PAGES-ADRESINIZ.pages.dev'
read -s -p 'Yönetici şifresi: ' OPUS_PASSWORD
export OPUS_PASSWORD
node scripts/import-media.mjs import ../private-media
unset OPUS_PASSWORD
```

Windows PowerShell’de güvenli parola girişi:

```powershell
$env:OPUS_SITE='https://SIZIN-PAGES-ADRESINIZ.pages.dev'
$secret=Read-Host 'Yönetici şifresi' -AsSecureString
$env:OPUS_PASSWORD=[System.Net.NetworkCredential]::new('', $secret).Password
node scripts/import-media.mjs import ../private-media
Remove-Item Env:OPUS_PASSWORD
```

Araç dosya SHA-256 değerlerini denetler, zaten aktarılmış kimlikleri atlar, fotoğrafları özel kovaya yükler ve boş veritabanına 40 eserlik içeriği **taslak** olarak kaydeder. Yarıda kesilirse aynı komutu tekrar çalıştırabilirsiniz. Mevcut içerik varsa üzerine başlangıç verisi yazmaz. Yeniden aktarım görselleri halka açmaz. Canlı site adresini bilmeden veya hesap anahtarları olmadan bu aktarım bu teslimatta çalıştırılmadı.

Fotoğraflar yüklendiği halde panel **İlk kurulum** gösteriyorsa **Genel bakış → Başlangıç içeriğini taslağa yükle** düğmesini kullanın. Panelde özel depodaki dosya sayısı görünür. Bu işlem yalnız boş taslakta, yönetici oturumuyla ve gereken 95 dosya mevcutken çalışır; mevcut içeriğin üzerine yazmaz. Eser galerisi kapalı hazırlanır, otomatik yayın veya görsel kilidi açılması yapılmaz. Eksik fotoğraf bildiriliyorsa Terminal'deki aynı aktarım komutunu tekrarlayın; yüklenen dosyalar atlanır.

Boş/null veya bazı listeleri eksik taslak artık menü geçişlerini kilitlemez. İlk kurulum tamamlanana kadar içerik kaydı/yayın düğmeleri kapalıdır; görseller, yedek ve hesap ekranlarına erişilebilir.

Sonra panelde giriş yapın → **Önizle** → içeriği kontrol edin → **Yayımla**. Metinler ve eser kartları hazır olur; fotoğraflar yine gizli kalır. Mühendis incelemesine kadar Ayarlar’daki açma düğmesini kullanmayın.

İlk aktarım tamamlandıktan sonra ücretsiz Cloudflare Turnstile’ı yönetici girişine ekleyebilirsiniz: hostname’leri tanımlayıp iki `TURNSTILE_*` değişkenini girin ve redeploy edin. CLI ile giriş de açık olduğunda geçerli `OPUS_CHALLENGE` token’ı ister. Token tek kullanımlık ve kısa ömürlüdür; rutin yedeği paneldeki **Tam yedek ZIP** düğmesiyle almak daha kolaydır.

## 5. Günlük panel kullanımı

- **Eserler:** Kod, üç dilde başlık/açıklama/medium, koleksiyon, yıl, gerçek genişlik ve yükseklik, gsm, asitsiz kağıt ve çerçeve durumu. Bilinmeyen ölçü/gramaj boş kalır; sitede uydurma değer gösterilmez. Ondalık ayırıcı olarak nokta veya virgül kabul edilir. Ölçüler genişlik × yükseklik olarak gösterilir.
- **Orijinal ve baskılar:** Aynı sayfada orijinal ve A4/A3 (ve ek boyutlar). Orijinalin satış durumu, fiyatları göster/gizle, her ürün/baskı için tam Etsy listing URL’si. Boş URL’de satın alma bağlantısı oluşmaz. Etsy dükkan ana sayfasını eser satın alma linki olarak kullanmayın. Etsy stoğu/fiyatı otomatik eşitlenmez.
- **Görseller:** Önceden filigranlanmış JPEG/PNG/WebP yükleyin; en fazla 8 MB ve uzun kenar 3000 px. Ana görseli seçip onaylayın. Yeni dosya seçmek ana görsel onayını sıfırlar. Dosyalar yüklenince otomatik yayımlanmaz.
- **Detaylar:** Ayrı filigranlı fotoğraf seçebilir veya ana fotoğraf üzerinde sürükleyerek detay kırpabilirsiniz. Kırpma kaynak filigranı dışarıda bırakabilir; sonucu kontrol edip onaylayın. Otomatik filigran eklenmez. Filigran kalmıyorsa ayrı hazırlanmış dosyayı yükleyin. Her detayın ayrıca onayı vardır.
- **Sıralama:** Eser/koleksiyon listelerindeki ↑↓ düğmeleriyle sırayı siz belirlersiniz. Ziyaretçide sıralama filtresi yoktur. Arşivleme geri alınabilir; kalıcı eser silme düğmesi yoktur.
- **Koleksiyonlar:** Dil bazında başlık, kapak, sıra ve görünürlük. Fotoğrafsız All of Us gizli başlar.
- **Site metinleri:** Başlıklar, About, FAQ, menü ve arayüz metinleri ayrı EN/NL/TR alanlarıdır. Metinler düz metindir; HTML/script çalıştırılmaz. Eser başlığı/açıklaması/medium için boş çeviri İngilizce karşılığa döner. Koleksiyon adları da boşsa İngilizce gösterilir.
- **Process:** Fotoğraf, metin ve YouTube bağlantısı. Sayfa ve kayıt görünürlüğü ayrı yönetilir. Video ziyaretçi tıklamadan YouTube’a bağlanmaz.
- **Ayarlar:** Ana sayfa yakın planı, isteğe bağlı mobil yakın plan, portre, gizlilik kilidi, JSON/tam ZIP yedeği, şifre değişimi.

### Home, About ve koleksiyon kapakları açık; eser galerisi kapalı

20.10.2026 güncellemesiyle **Ayarlar ve yedek → Eser galerisi → Eser galerisini ve tekil eser sayfalarını göster** kutusu eklendi. İşaretini kaldırıp **Kaydet → Önizle → Yayımla** uygulayın. Koleksiyonlar ekranında açık kalacak koleksiyonların **Sitede göster** kutusunu ve **Kapak eseri** seçimini kontrol edin. Fotoğrafı onaylı olmayan koleksiyon için kapak uydurulmaz.

Bu düzen tekil eser kayıtlarını public API'den çıkarır, Gallery bağlantılarını gizler ve yalnız seçili kapak fotoğrafları ile Home/About fotoğraflarına izin verir. Kapakta kullanılan fotoğraf görünür; o eserin sayfası, bilgileri ve detay fotoğrafları açılmaz. Diğer eserlerin dosya URL'leri de 404 döner. Ayarı tekrar işaretleyip yayımlamak onaylı eser galerisini geri getirir.

**Bütün resimleri gizle** ayrı acil kilittir: kapak, hero ve portreyi de kapatır. İstenen sınırlı düzeni önce kaydedip yayımlayın; önizleme kontrolünden sonra Ayarlar'daki **Mühendis onayıyla görselleri aç** düğmesiyle global kilidi açın. Kutuyu kapatmadan global kilidi açmak mevcut eser galerisini de görünür yapabilir. Yeni seçenek veritabanı şeması değişikliği veya fotoğrafları yeniden yükleme gerektirmez. Kod güncellemesi mevcut panel içeriğini sıfırlamaz.

**Kaydet → Önizle → Yayımla.** Kaydet canlı siteyi değiştirmez. Önizle önce taslağı kaydeder ve yalnız yönetici oturumu ile açar. Yayımla taslağı atomik olarak canlı metaveriye aktarır. İki sekmede aynı sürümü değiştirmek sessizce veri ezmez; çakışmada yeniden yükleme gerekir. Kaydedilmemiş veriniz varsa önce kopyalayın.

## 6. Koleksiyon bazında ortak baskı fiyatı

**Toplu fiyat** ekranında koleksiyon, mevcut baskı boyutu ve EUR fiyatını seçin. Önizle’de eski/yeni fiyatlar ve o boyutu olmayan hariç eserler listelenir. Uygula yalnız mevcut boyutları değiştirir; yeni baskı seçeneği oluşturmaz, orijinal fiyatlarına veya diğer koleksiyonlara dokunmaz. Önce taslağa kaydedilir. Canlıya almak için Yayımla’yı kullanın.

Geri alma: Sürüm geçmişinde **bulk-price** işleminden önceki kaydı taslağa geri yükleyin, önizleyin ve gerekirse yayımlayın. Geri yükleme fotoğraf gizleme kilidine dokunmaz.

## 7. info@turquoiseopus.art iletişim formu

FormSubmit AJAX kullanır; ziyaretçi sitenizden çıkmaz veya e-posta uygulaması açmaz. Ad, ziyaretçinin yanıt e-postası, mesaj ve varsa eser referansı iletilir. `_replyto` ziyaretçidir; yanıtı kendi posta kutunuzdan gönderirsiniz. Şifreniz frontend’e konmaz.

**Posta kutusunun var olması entegrasyonu aktive etmez.** Canlı alan adındaki formdan kendiniz ilk test mesajını gönderin; info@ kutusuna gelen FormSubmit onayını tamamlayın. Ardından ikinci testle mesajın gerçekten geldiğini, Reply-To’nun ziyaretçi olduğunu ve spam klasörünü kontrol edin. Bu teslimatta gerçek e-posta gönderilmedi veya aktivasyon yapılmadı. Başarı mesajı yalnız hizmet olumlu cevap verirse gösterilir; timeout/hata halinde form metni korunur. E-posta teslimatı sağlayıcı kabulünden sonra ayrıca doğrulanmalıdır.

İletişim sayfasında adrese ait düz metin iletişim bağlantısı yoktur. Teslimat adresi endpoint’te teknik olarak görülebilir; bu adresin internetten saklanacağına ilişkin bir iddia yoktur. FormSubmit üçüncü taraf veri işler. Gizlilik metnini panelden gerçek kullanımınıza göre gözden geçirin. SMTP sağlayıcısına geçmek isterseniz bu form akışı ayrı bir sunucu adaptörüyle değiştirilebilir.

## 8. Maliyet ve sınırlar

Varsayılan kurulum **Cloudflare Pages Free + Supabase Free + FormSubmit** üzerinden yapılır. Ücretli plan veya abonelik otomatik açılmaz. Mevcut alan adı ve e-posta kutusu hizmetiniz ayrıdır.

19.10.2026’da resmi sayfalarda: Cloudflare Free, Pages Functions ile paylaşılan günlük 100.000 fonksiyon isteği; Supabase Free, 1 GB dosya deposu, 500 MB veritabanı ve 5 GB egress kotası listeliyor. Bu fotoğraf seti yaklaşık 84 MB. Gizlilik için fotoğraflar önbelleğe alınmadığından trafik kotasını takip edin. Supabase ücretsiz projeleri bir haftalık hareketsizlikte duraklatabiliyor; böyle bir durumda fotoğraf servisi kapalı kalır. Ücretsiz katman sınırsız/garantili hizmet değildir.

Resmi kaynaklar:
- https://developers.cloudflare.com/pages/functions/pricing/
- https://developers.cloudflare.com/pages/functions/routing/
- https://supabase.com/pricing
- https://supabase.com/docs/guides/storage/buckets/fundamentals
- https://supabase.com/docs/guides/storage/security/access-control
- https://supabase.com/docs/reference/javascript/auth-getuser
- https://formsubmit.co/
- https://formsubmit.co/ajax-documentation

Vercel Hobby kişisel/ticari olmayan kullanım içindir; bu Etsy’ye yönlendiren ticari portfolyo için varsayılan seçilmedi: https://vercel.com/docs/plans/hobby

## 9. QA ve mühendis onayı

`npm run qa` ile 53 test, üretim derlemesi, JavaScript sözdizimi ve özel fotoğrafların public çıktıda bulunmaması kontrolü çalışır. Testler gerçek SaaS hesabı yerine API mock’ları ve Node içinde render kontrolleri kullanır; canlı servis entegrasyonu ve cihaz testi olarak sunulmaz. GitHub QA ayrıca Pages ortamındaki Wrangler 3.114.17 ile Functions derlemesini denetler. Başlangıç içeriğinin taşınabilir JS modülü derleme sırasında `seed/content.json` dosyasından yenilenir; public çıktıya konmaz.

Detay: `docs/QA_REPORT.md`. Tarayıcı kontrol listesi: `docs/BROWSER_QA.md`. Paneli kurtarma: **`docs/ADMIN_RECOVERY.md`**. Teknik kapsam: `docs/SPEC.md`.

Bu paket GitHub’a push edilmedi, servis hesabı açılmadı ve alan adına deploy yapılmadı. Kullanıcıya ait hesap/secret kurulumu gerekir. Önizleme ortamına erişip gerçek masaüstü/mobil tarayıcı testleri tamamlanmadan “mühendis onaylı” olarak işaretlemeyin.
