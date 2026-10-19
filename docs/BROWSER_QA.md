# Gerçek tarayıcı ve mobil kontrolü

Bu kontrol listesi kurulumdan sonra uygulanır. Henüz yapılmış değildir. Üretimdeki gerçek içerikle deney yapmadan önce ayrı staging projesinde çalışın. E-posta gönderen veya görselleri halka açan testleri bilinçli başlatın.

## Ekranlar

| Cihaz/viewport | Kontrol |
|---|---|
| Masaüstü 1440×900 ve 1920×1080 | Chrome + Firefox; header/footer, üç kolon galeri, carousel merkezleme |
| Tablet 768×1024 | İki kolon, yön değişimi, dokunma hedefleri |
| Mobil 390×844 ve 360×800 | Menü, EN/NL/TR, tek kolon, form ve taşma |
| iPhone Safari | Sabit fon, blur, dialog, pinch zoom, klavye açılması |
| Android Chrome | Carousel, dokunmatik zoom, e-posta formu |

## Ziyaretçi

- Her sayfada `turquoise opus.` ve header düzeni aynı; kullanıcıya admin linki gösterilmez.
- EN/NL/TR; menü, About, FAQ, eser detayları ve independent başlığı tutarlı değişir; seçim sonraki sayfada kalır.
- Ana sayfada kaydırma yakın planı yukarı taşır; Collections başlığına yeterli boşluk kalır. Koleksiyonlar her iki yönde tam döngü yapar; merkezdeki kapak/ad ortadadır. Sol/sağ klavye okları çalışır.
- Eser kapakları ve adları aynı yere gider. Galeri/koleksiyonlarda bej paspartu ve hizalar aynıdır. Kullanıcı sıralama seçemez.
- Global kilit açıkken ağ panelinde başarılı `/api/media/…` cevabı yok; eski bir direkt URL 404. Portre ve Process fotoğrafları da kapalıdır. Dekoratif suluboya fonu kalır.
- Onaylı erişim açıldıktan sonra ayrıntı görselleri ve ana sayfa mobil yakın planı doğru dosyadır. +/−, mouse wheel, pinch, sürükleme ve Escape ile zoom çalışır; kapanınca odak döner.
- Orijinal + A4/A3 fiyat/linkleri aynı sayfada. Satıldı orijinalden satın alma yok; baskılar bağımsız. Fiyat gizliyken hiçbir fiyat gösterilmez. Bağlantı tam Etsy listing’e gider.
- Fotoğrafı onaysız eserlerin kartı ve bireysel içeriği yok. All of Us ve Process gizli.
- FAQ kutuları ayrı ayrı açılır; reduced-motion tercihinde hareket yoktur. Klavye ile bütün kontroller erişilebilirdir.
- Footer ikonları Etsy → Instagram sırasında, Get in touch altında, yazısız ve erişilebilir etiketlidir.
- İletişim formu required/email doğrulaması yapar. Hata/timeout mesajı ve metnin korunması, çift gönderimin engellenmesi test edilir. Gerçek teslim için ilk aktivasyonu sahibi tamamlar; ikinci mesaj inbox ve Reply-To’da kontrol edilir.

## Yönetici

- Oturumsuz API state/preview/media preview kapalı. Yanlış hesabın e-postası benzer olsa dahi UUID reddedilir.
- Login cookie’leri HttpOnly, Secure, SameSite=Strict. Network cevabında token JSON’u yoktur. Kaynakta service_role key yoktur.
- Kaydet sonrası canlı metin değişmez; Önizle taslağı gösterir; Yayımla değiştirir ve global fotoğraf kilidini açmaz.
- Yeni eser → filigranlı fotoğraf → gerçek ölçüler → Etsy URL → kayıt → önizleme → yayın akışı denenir. Yeni dinamik eser/koleksiyon URL’si 404 HTTP’ye düşmez.
- Ondalık `29,7` doğru sayıya dönüşür; yön değiştirirken santimetre değerleri yuvarlanmaz. 004/011 genişlik 29,7, yükseklik 21 kalır.
- Onay verilmemiş detay public olmaz. Crop işareti, seçilen alan ve üretilen çıktı eşleşir; filigran görünmüyorsa kayıt onaylanmaz.
- Toplu fiyat önizlemesindeki hedef/hariç sayıları doğru; yalnız seçili boyut değişir. Undo doğru taslağı getirir.
- Arşivle/geri çıkar ve manuel sıra çalışır. Bir eserin ana fotoğrafını değiştirmek onayı sıfırlar.
- Bütün resimleri gizle tek işlemle çalışır; açık ziyaretçi sayfası en geç sonraki 15 saniyelik kontrolünde fotoğrafları kaldırır. Yeni direkt talepler hemen reddedilir.
- Tam ZIP yedeği indirilir, açılır, bütün fotoğraflar + backup.json bulunur. Ayrı staging projesinde restore ve resim kimlikleri kontrol edilir.
- İki admin sekmesinde çakışma sessiz veri ezmeye yol açmaz. Şifre değişimi, oturum yenileme ve şifre kurtarma denemesi tamamlanır.

İsteğe bağlı otomatik smoke koşumu: `scripts/browser-qa.mjs`. Playwright kurulumu ve gerçek HTTPS test URL’si gerektirir. Bu betik mail göndermez, veri değiştirmez ve global kilidi açmaz; görsel/etkileşimli elle kontrolün yerine geçmez.
