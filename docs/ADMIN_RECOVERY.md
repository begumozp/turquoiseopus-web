# Turquoise Opus — yönetici panelini kurtarma

Hesap: **info@turquoiseopus.art**. Panel: kendi sitenizde `/admin`.

Bu kılavuzda gerçek şifre veya API anahtarı yoktur. Cloudflare, Supabase ve alan adı hesabınızın sahiplik erişimini güvenli bir parola yöneticisinde saklayın. Kurtarma dosyalarını GitHub’a yüklemeyin.

## 1. Önce fotoğrafları kapatın

Panele girebiliyorsanız üst çubuktaki **Bütün resimleri gizle** düğmesine basın. Bu işlem Kaydet/Yayımla gerektirmez.

Panele giremiyorsanız Supabase SQL Editor’da:

```sql
update public.opus_state
set images_hidden = true
where id = 1;
```

Oturumsuz bir pencerede daha önce açılan bir `/api/media/…` URL’sini deneyin: 404 dönmeli. Admin önizlemesindeki `?preview=1` URL’sini test olarak kullanmayın; orası yetkili oturum içindir. Kilit, yeni sunucu taleplerini kapatır; daha önce indirilmiş veya ekran görüntüsü alınmış kopyaları silemez. Açık sayfalar 15 saniyelik kontrollerde görselleri kaldırır. Kontrol servisine erişilemezse de görseller kaldırılır. Başlamış aktarımı, kullanıcının belleğini veya harici kopyaları geriye dönük geri çağırma garantisi yoktur.

## 2. Şifre unutuldu

1. Supabase sahibi hesabıyla doğru projeye girin.
2. Authentication → Users altında `info@turquoiseopus.art` kaydını ve UUID’sini bulun. Yeni bir ikinci yönetici yaratmak yerine mevcut kullanıcıyı kurtarın.
3. Projenin parola sıfırlama akışını veya kullanıcı yönetimi araçlarını kullanın. E-posta ile kurtarma için Supabase Auth’un SMTP/yönlendirme ayarlarının ayrıca çalışması gerekir; mevcut info@ posta kutusu bunları otomatik yapılandırmaz.
4. E-posta akışına bağlı kalmadan teknik kurtarma için pakette `scripts/reset-admin.mjs` vardır. Proje URL’si, server-only service_role key ve doğru kullanıcı UUID’sini **yerel ve gitignore kapsamındaki** `.dev.vars` dosyasına koyun. `.env.example` biçimini izleyin. Ekran görüntüsü veya terminal geçmişiyle paylaşmayın.

Bash örneği:

```bash
read -s -p 'Yeni güçlü şifre: ' OPUS_NEW_PASSWORD
export OPUS_NEW_PASSWORD
node --env-file=.dev.vars scripts/reset-admin.mjs
unset OPUS_NEW_PASSWORD
```

Bu araç Supabase Admin API ile yalnız belirtilen UUID’nin şifresini günceller. Gerçek anahtarlar terminale basılmaz. Paneldeki şifre değiştirici, giriş yapılmış oturumda en az 14 karakter kabul eder. Hesap şüphesi varsa Supabase’de aktif oturumları da sonlandırın; yalnız parola değiştirmiş olmayı bütün token’ların iptal edildiği şeklinde yorumlamayın.

## 3. Doğru şifreye rağmen 403

Şunları karşılaştırın:

| Kontrol | Beklenen |
|---|---|
| Auth kullanıcı e-postası | `info@turquoiseopus.art` |
| Auth e-posta onayı | Tamamlanmış |
| Cloudflare `ADMIN_USER_ID` | Aynı kullanıcının tam UUID’si |
| Cloudflare `ADMIN_EMAIL` | Aynı e-posta |
| Supabase URL ve anahtarlar | Aynı proje |

Cloudflare’da secret değiştirince yeniden deploy edin. Başka UUID’li yeni bir hesap oluşturursanız eski oturum otomatik yetki kazanmaz. UUID kontrolünü koddan kaldırarak çözmeye çalışmayın.

Turnstile hata veriyorsa site key/secret key çiftini ve izin verilen alan adlarını kontrol edin. Girişte IP başına 15 dakikada 8 deneme sınırı bulunur. Bekleyin; güvenlik sınırını sürekli kaldırmayın. Test/kurulum alan adlarını da Turnstile paneline ekleyin.

## 4. Oturum 401 ile bitti

Panel erişim token’ı süresi dolunca HttpOnly refresh cookie ile yenilemeyi dener. Başarısızsa tekrar giriş yapın. Kaydedilmemiş metni önce kopyalayın. Şifre, tarayıcı localStorage’ında tutulmaz; JavaScript’in okuyabildiği bir yönetici token’ı yoktur. Özel tarayıcı modunda veya çerezler kapalıyken oturum kalıcı olmayabilir.

## 5. Yanlış metin, fiyat veya sıralama

- Yalnız formda değiştiyse ve kaydedilmediyse sayfayı yeniden yüklemek son kaydı getirir. Önce korumak istediğiniz metni kopyalayın.
- Kaydedildiyse **Sürüm geçmişi** bölümünden önceki kaydı **taslağa geri yükleyin**.
- Önizleme ile kontrol edin. Önceki canlı sürüme dönmek için uygun taslağı **Yayımla** ile yayımlayın.
- Toplu fiyat geri alma için `bulk-price` kaydını bulun. Bu kayıttaki belge işlemden hemen önceki durumdur.
- Geri yükleme tüm içerik belgesini etkiler; yalnız tek fiyat alanını geri almaz. İşlemden sonra yapılmış başka değişiklikleri gerekiyorsa yeniden uygulayın.
- Son 100 içerik sürümü tutulur. Daha eski durumlar için dışa aktarılmış yedeğiniz gerekir.

Hiçbiri global fotoğraf kilidini açmaz.

## 6. Yedek alma

**Ayarlar ve yedek → Tam yedek ZIP**, içerik JSON’unu ve özel fotoğrafları tek dosyada indirir. 95 dosyalı mevcut sette yaklaşık 84 MB olduğu için bilgisayarda alın. ZIP’in açıldığını kontrol edin; bir kopyasını cihaz dışında güvenli bir yerde tutun. Yedek dosyası özel fotoğrafları içerir; public klasörüne/GitHub’a koymayın.

Yalnız **İçerik JSON yedeği** fotoğrafları içermez. JSON’da taslak, yayımlanmış belge ve medya kimlikleri vardır; geçmiş 100 revizyonun tamamı bu dosyada arşivlenmez. Kod yedeği, içerik ve fotoğraf yedeğinin yerine geçmez.

Teknik toplu yedek alternatifi:

```bash
# OPUS_SITE ve OPUS_PASSWORD önce güvenli şekilde ayarlanmalı.
node scripts/import-media.mjs backup ../opus-backup
```

Turnstile etkinse CLI girişi geçerli `OPUS_CHALLENGE` ister. Pratik kullanımda panel ZIP’i tercih edin. Yedek otomatik bir zamanlayıcıyla alınmıyor; düzenli kopyayı siz başlatırsınız.

## 7. Aynı projede içerik yedeğini geri yükleme

1. Fotoğrafları gizleyin ve önce mevcut durumun yedeğini alın.
2. Ayarlar’da `backup.json` dosyasını seçin → **Taslağa aktar**.
3. Medya kimliklerinin mevcut özel dosyalarla eşleştiğini doğrulayın. Eksik medya varsa kayıt yayımlama sırasında reddedilir; aşağıdaki tam kurtarmayı kullanın.
4. Önizleyin ve yayımlayın. Mühendis onayına kadar fotoğrafları açmayın.

Bu arayüz yedekteki `state.draft` belgesini alır. Özellikle yedeğin yayımlanmış anına dönmeniz gerekiyorsa mühendisiniz kontrollü şekilde `state.published` belgesini taslak olarak aktarabilir. Orijinal yedeği koruyun.

## 8. Silinmiş Supabase projesi / tam kurtarma

1. Yeni Supabase projesi açın ve `schema.sql` çalıştırın.
2. Aynı e-posta için tek kullanıcı oluşturun/onaylayın. **Yeni UUID’yi** Cloudflare secret’ına yazın.
3. Yeni URL/anahtarları Cloudflare’da güncelleyin, deploy edin. Kilit varsayılan olarak kapalıdır.
4. Tam yedek ZIP’i repo dışında bir klasöre açın. İçinde `backup.json` ve UUID isimli fotoğraf dosyaları olmalı.
5. HTTPS site adresi ve şifre ile:

```bash
node scripts/import-media.mjs restore ../opus-backup
```

Araç dosyaları özgün medya kimlikleriyle özel kovaya yükler, var olanları atlar ve yedek taslağını kaydeder. İlk işlem fotoğrafları gizlemektir. Aracın bitişi otomatik yayın değildir; panelde önizleme ve yayın kontrolü gerekir.

İlk teslimdeki `Private_Media` paketleri tam panel yedeğinin alternatifi değildir: sadece başlangıç setini kurtarır. Sonradan yüklenen görseller için kendi tam yedeğiniz gerekir.

## 9. Panel/site 503 veya boş

- Supabase ücretsiz proje duraklatıldı mı? Dashboard’dan durumu kontrol edin ve gerekiyorsa yeniden etkinleştirin.
- Cloudflare Functions gerçekten deploy edildi mi? GitHub Pages statik yayını yeterli değildir.
- Gerekli secret’ların tamamı doğru mu? `ADMIN_USER_ID` bir e-posta değil, UUID olmalı.
- SQL tabloları ve `opus-private` bucket doğru projede mi?
- `/api/config`, `/api/public`, `/api/state` cevaplarını inceleyin. Oturumsuz `/api/state` için 401 normaldir.
- Cloudflare’da eski deploy sürümüne dönmek kodu geri alır; veritabanı içeriğini geri almaz. İçerik için Sürüm geçmişi/yedek gerekir.
- Cache, CSP veya DNS hatası varsa API’yi public yaparak, RLS’yi kapatarak ya da bucket’ı Public’e çevirerek çözmeyin.

## 10. Anahtar sızıntısı şüphesi

Fotoğrafları SQL’den kapatın; Supabase service_role/secret anahtarını ve etkilenmiş hesap şifrelerini değiştirin. Cloudflare’daki yeni secret’larla redeploy edin. GitHub’a sızmış anahtarı yalnız dosyadan silmek yeterli değildir; anahtar iptal edilmeli ve repo geçmişi de incelenmelidir. Sunucunun yalnız yeni anahtarı kullandığını ve anon isteğin doğrudan Storage’dan indirme yapamadığını yeniden test edin.
