/**
 * @fileOverview Data statis untuk Hadits dan Doa Harian
 */

export interface Hadits {
  id: number;
  title: string;
  arabic: string;
  translation: string;
  source: string;
}

export interface Doa {
  id: number;
  title: string;
  arabic: string;
  latin: string;
  translation: string;
  category: 'Harian' | 'Sholat' | 'Pagi-Petang';
}

export const HADITS_LIST: Hadits[] = [
  { id: 1, title: "Niat", arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", translation: "Sesungguhnya setiap amal perbuatan tergantung pada niatnya.", source: "HR. Bukhari & Muslim" },
  { id: 2, title: "Kebersihan", arabic: "الطُّهُورُ شَطْرُ الإِيمَانِ", translation: "Kebersihan itu sebagian dari iman.", source: "HR. Muslim" },
  { id: 3, title: "Senyum adalah Sedekah", arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ", translation: "Senyummu di hadapan saudaramu adalah sedekah.", source: "HR. Tirmidzi" },
  { id: 4, title: "Mencintai Saudara", arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", translation: "Tidak sempurna iman seseorang di antara kalian hingga ia mencintai saudaranya sebagaimana ia mencintai dirinya sendiri.", source: "HR. Bukhari & Muslim" },
  { id: 5, title: "Berkata Baik atau Diam", arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُطْ", translation: "Barangsiapa beriman kepada Allah dan hari akhir, hendaklah ia berkata baik atau diam.", source: "HR. Bukhari & Muslim" },
  { id: 6, title: "Menuntut Ilmu", arabic: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ", translation: "Menuntut ilmu adalah kewajiban bagi setiap Muslim.", source: "HR. Ibnu Majah" },
  { id: 7, title: "Keutamaan Al-Quran", arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", translation: "Sebaik-baik kalian adalah orang yang belajar Al-Quran dan mengajarkannya.", source: "HR. Bukhari" },
  { id: 8, title: "Larangan Marah", arabic: "لاَ تَغْضَبْ وَلَكَ الْجَنَّةُ", translation: "Janganlah marah, maka bagimu surga.", source: "HR. Thabrani" },
  { id: 9, title: "Malu Sebagian dari Iman", arabic: "الْحَيَاءُ مِنَ الإِيمَانِ", translation: "Malu itu sebagian dari iman.", source: "HR. Bukhari & Muslim" },
  { id: 10, title: "Tangan di Atas", arabic: "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى", translation: "Tangan yang di atas lebih baik daripada tangan yang di bawah.", source: "HR. Bukhari & Muslim" },
  { id: 11, title: "Saling Memberi Hadiah", arabic: "تَهَادَوْا تَحَابُّوا", translation: "Saling berilah hadiah, niscaya kalian akan saling mencintai.", source: "HR. Al-Bukhari" },
  { id: 12, title: "Pentingnya Sholat", arabic: "الصَّلاةُ نُورٌ", translation: "Sholat adalah cahaya.", source: "HR. Muslim" },
  { id: 13, title: "Berbuat Baik", arabic: "كُلُّ مَعْرُوفٍ صَدَقَةٌ", translation: "Setiap kebaikan adalah sedekah.", source: "HR. Bukhari & Muslim" },
  { id: 14, title: "Larangan Mencela", arabic: "سِبَابُ الْمُسْلِمِ فُسُوقٌ", translation: "Mencela seorang Muslim adalah kefasikan.", source: "HR. Bukhari & Muslim" },
  { id: 15, title: "Persaudaraan Muslim", arabic: "الْمُسْلِمُ أَخُو الْمُسْلِمِ", translation: "Seorang Muslim adalah saudara bagi Muslim lainnya.", source: "HR. Muslim" },
  { id: 16, title: "Kasih Sayang", arabic: "مَنْ لا يَرْحَمُ لا يُرْحَمُ", translation: "Barangsiapa tidak menyayangi, maka tidak akan disayangi.", source: "HR. Bukhari & Muslim" },
  { id: 17, title: "Kejujuran", arabic: "عَلَيْكُمْ بِالصِّدْقِ", translation: "Hendaklah kalian selalu jujur.", source: "HR. Muslim" },
  { id: 18, title: "Menjaga Lisan", arabic: "أَمْسِكْ عَلَيْكَ لِسَانَكَ", translation: "Jagalah lisanmu.", source: "HR. Tirmidzi" },
  { id: 19, title: "Keutamaan Doa", arabic: "الدُّعَاءُ هُوَ الْعِبَادَةُ", translation: "Doa adalah ibadah.", source: "HR. Abu Daud" },
  { id: 20, title: "Memudahkan Urusan", arabic: "يَسِّرُوا وَلا تُعَسِّرُوا", translation: "Mudahkanlah dan jangan persulit.", source: "HR. Bukhari & Muslim" },
  { id: 21, title: "Adab Makan", arabic: "سَمِّ اللَّهَ وَكُلْ بِيَمِينِكَ", translation: "Sebutlah nama Allah dan makanlah dengan tangan kananmu.", source: "HR. Bukhari & Muslim" },
  { id: 22, title: "Haramnya Kedzaliman", arabic: "الظُّلْمُ ظُلُمَاتٌ يَوْمَ الْقِيَامَةِ", translation: "Kedzaliman adalah kegelapan di hari kiamat.", source: "HR. Bukhari & Muslim" },
  { id: 23, title: "Menutup Aib", arabic: "مَنْ سَتَرَ مُسْلِمًا سَتَرَهُ اللَّهُ", translation: "Barangsiapa menutupi aib seorang Muslim, Allah akan menutupi aibnya.", source: "HR. Muslim" },
  { id: 24, title: "Kebaikan Akhlak", arabic: "إِنَّمَا بُعِثْتُ لأُتَمِّمَ مَكَارِمَ الأَخْلاقِ", translation: "Sesungguhnya aku diutus untuk menyempurnakan akhlak yang mulia.", source: "HR. Al-Bukhari" },
  { id: 25, title: "Menyebarkan Salam", arabic: "أَفْشُوا السَّلامَ بَيْنَكُمْ", translation: "Sebarkanlah salam di antara kalian.", source: "HR. Muslim" },
  { id: 26, title: "Sabar", arabic: "الصَّبْرُ ضِيَاءٌ", translation: "Sabar itu adalah sinar yang terang.", source: "HR. Muslim" },
  { id: 27, title: "Bakti Orang Tua", arabic: "رِضَى الرَّبِّ فِي رِضَى الْوَالِدِ", translation: "Ridha Allah terletak pada ridha orang tua.", source: "HR. Tirmidzi" },
  { id: 28, title: "Menjaga Sholat Subuh", arabic: "مَنْ صَلَّى الصُّبْحَ فَهُوَ فِي ذِمَّةِ اللَّهِ", translation: "Barangsiapa sholat subuh, maka ia berada dalam jaminan Allah.", source: "HR. Muslim" },
  { id: 29, title: "Islam itu Tinggi", arabic: "الإِسْلامُ يَعْلُو وَلا يُعْلَى عَلَيْهِ", translation: "Islam itu tinggi dan tidak ada yang lebih tinggi darinya.", source: "HR. Daruquthni" },
  { id: 30, title: "Dunia Penjara Mukmin", arabic: "الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ", translation: "Dunia adalah penjara bagi mukmin dan surga bagi orang kafir.", source: "HR. Muslim" }
];

export const DOA_LIST: Doa[] = [
  { id: 1, title: "Bangun Tidur", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", latin: "Alhamdu lillahil ladzi ahyana ba'da ma amatana wa ilaihin nusyur", translation: "Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami dan kepada-Nya lah kami kembali.", category: "Harian" },
  { id: 2, title: "Sebelum Makan", arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ", latin: "Allahumma barik lana fima razaqtana wa qina 'adzaban nar", translation: "Ya Allah, berkahilah rezeki yang Engkau berikan kepada kami dan peliharalah kami dari siksa api neraka.", category: "Harian" },
  { id: 3, title: "Setelah Makan", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ", latin: "Alhamdu lillahil ladzi ath'amana wa saqana wa ja'alana muslimin", translation: "Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami orang-orang Muslim.", category: "Harian" },
  { id: 4, title: "Masuk Masjid", arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", latin: "Allahummaf-tah li abwaba rahmatik", translation: "Ya Allah, bukakanlah bagiku pintu-pintu rahmat-Mu.", category: "Harian" },
  { id: 5, title: "Keluar Masjid", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ", latin: "Allahumma inni as-aluka min fadllik", translation: "Ya Allah, sesungguhnya aku memohon keutamaan dari-Mu.", category: "Harian" },
  { id: 6, title: "Dzikir Istighfar (Setelah Sholat)", arabic: "أَسْتَغْفِرُ اللَّهَ (٣x)", latin: "Astaghfirullah (3x)", translation: "Aku memohon ampun kepada Allah.", category: "Sholat" },
  { id: 7, title: "Doa Keselamatan (Setelah Sholat)", arabic: "اللَّهُمَّ أَنْتَ السَّلامُ وَمِنْكَ السَّلامُ تَبَارَكْتَ يَا ذَا الْجَلالِ وَالإِكْرَامِ", latin: "Allahumma antas salam wa minkas salam tabarakta ya dzal jalali wal ikram", translation: "Ya Allah, Engkau adalah Dzat yang memberi keselamatan, dan dari-Mu lah keselamatan, Maha Berkah Engkau, wahai Dzat Yang Memiliki Keagungan dan Kemuliaan.", category: "Sholat" },
  { id: 8, title: "Doa Memohon Ilmu yang Bermanfaat", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا", latin: "Allahumma inni as-aluka 'ilman nafi'an wa rizqan thayyiban wa 'amalan mutaqabbalan", translation: "Ya Allah, sesungguhnya aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima.", category: "Sholat" },
  { id: 9, title: "Doa Orang Tua", arabic: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", latin: "Rabbighfir li wali-walidayya warhamhuma kama rabbayani shaghira", translation: "Wahai Tuhanku, ampunilah dosaku dan dosa kedua orang tuaku, serta sayangilah mereka sebagaimana mereka menyayangiku di waktu kecil.", category: "Harian" },
  { id: 10, title: "Doa Kebaikan Dunia Akhirat", arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", latin: "Rabbana atina fid dunya hasanah wa fil akhirati hasanah wa qina 'adzaban nar", translation: "Wahai Tuhan kami, berikanlah kami kebaikan di dunia dan kebaikan di akhirat serta peliharalah kami dari siksa api neraka.", category: "Harian" },
  { id: 11, title: "Sebelum Belajar", arabic: "رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا", latin: "Rabbi zidni 'ilman warzuqni fahman", translation: "Ya Allah, tambahkanlah aku ilmu dan berikanlah aku pemahaman yang baik.", category: "Harian" },
  { id: 12, title: "Sebelum Tidur", arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", latin: "Bismika Allahumma amutu wa ahya", translation: "Dengan nama-Mu ya Allah, aku mati dan aku hidup.", category: "Harian" },
  { id: 13, title: "Masuk Kamar Mandi", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ", latin: "Allahumma inni a'udzu bika minal khubutsi wal khaba-its", translation: "Ya Allah, sesungguhnya aku berlindung kepada-Mu dari setan laki-laki dan setan perempuan.", category: "Harian" },
  { id: 14, title: "Keluar Kamar Mandi", arabic: "غُفْرَانَكَ الْحَمْدُ لِلَّهِ الَّذِي أَذْهَبَ عَنِّي الأَذَى وَعَافَانِي", latin: "Ghufranakal hamdu lillahil ladzi adzhaba 'annil adza wa 'afani", translation: "Aku memohon ampunan-Mu. Segala puji bagi Allah yang telah menghilangkan kotoran dari badanku dan yang telah menyehatkan aku.", category: "Harian" },
  { id: 15, title: "Berpakaian", arabic: "الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلا قُوَّةٍ", latin: "Alhamdu lillahil ladzi kasani hadza wa razaqanihi min ghairi haulin minni wa la quwwatin", translation: "Segala puji bagi Allah yang telah memberi pakaian ini kepadaku sebagai rezeki daripada-Nya tanpa daya dan kekuatan dariku.", category: "Harian" },
  { id: 16, title: "Melepas Pakaian", arabic: "بِسْمِ اللَّهِ الَّذِي لا إِلَهَ إِلا هُوَ", latin: "Bismillahil ladzi la ilaha illa huwa", translation: "Dengan nama Allah yang tiada Tuhan selain-Nya.", category: "Harian" },
  { id: 17, title: "Bercermin", arabic: "اللَّهُمَّ كَمَا حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي", latin: "Allahumma kama hassanta khalqi fahassin khuluqi", translation: "Ya Allah, sebagaimana Engkau telah memperbagus kejadianku (rupa), maka baguskanlah budi pekertiku.", category: "Harian" },
  { id: 18, title: "Keluar Rumah", arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لا حَوْلَ وَلا قُوَّةَ إِلا بِاللَّهِ", latin: "Bismillahi tawakkaltu 'alallah la haula wa la quwwata illa billah", translation: "Dengan nama Allah, aku bertawakal kepada Allah, tiada daya dan kekuatan kecuali dengan pertolongan Allah.", category: "Harian" },
  { id: 19, title: "Masuk Rumah", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلَجِ وَخَيْرَ الْمَخْرَجِ", latin: "Allahumma inni as-aluka khairal maulaji wa khairal makhraji", translation: "Ya Allah, aku memohon kepada-Mu sebaik-baik tempat masuk dan sebaik-baik tempat keluar.", category: "Harian" },
  { id: 20, title: "Naik Kendaraan", arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ", latin: "Subhanal ladzi sakh-khara lana hadza wa ma kunna lahu muqrinin", translation: "Maha Suci Allah yang telah menundukkan semua ini bagi kami padahal kami sebelumnya tidak mampu menguasainya.", category: "Harian" },
  { id: 21, title: "Dzikir Tasbih (Setelah Sholat)", arabic: "سُبْحَانَ اللَّهِ (٣٣x)", latin: "Subhanallah (33x)", translation: "Maha Suci Allah.", category: "Sholat" },
  { id: 22, title: "Dzikir Tahmid (Setelah Sholat)", arabic: "الْحَمْدُ لِلَّهِ (٣٣x)", latin: "Alhamdulillah (33x)", translation: "Segala puji bagi Allah.", category: "Sholat" },
  { id: 23, title: "Dzikir Takbir (Setelah Sholat)", arabic: "اللَّهُ أَكْبَرُ (٣٣x)", latin: "Allahu Akbar (33x)", translation: "Allah Maha Besar.", category: "Sholat" },
  { id: 24, title: "Ayat Kursi (Setelah Sholat)", arabic: "اللَّهُ لا إِلَهَ إِلا هُوَ الْحَيُّ الْقَيُّومُ...", latin: "Allahu la ilaha illa huwal hayyul qayyum...", translation: "Allah, tidak ada Tuhan selain Dia Yang Maha Hidup lagi terus-menerus mengurus makhluk-Nya...", category: "Sholat" },
  { id: 25, title: "Doa Keteguhan Iman", arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ", latin: "Ya muqallibal qulub thabbit qalbi 'ala dinik", translation: "Wahai Dzat yang membolak-balikkan hati, teguhkanlah hatiku di atas agama-Mu.", category: "Harian" },
  { id: 26, title: "Doa Mohon Ampunan", arabic: "رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا", latin: "Rabbana-ghfir lana dzunubana wa israfana fi amrina", translation: "Wahai Tuhan kami, ampunilah dosa-dosa kami dan tindakan-tindakan kami yang berlebih-lebihan dalam urusan kami.", category: "Harian" },
  { id: 27, title: "Doa Perlindungan dari Malas", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ", latin: "Allahumma inni a'udzu bika minal 'ajzi wal kasal", translation: "Ya Allah, aku berlindung kepada-Mu dari kelemahan dan rasa malas.", category: "Harian" },
  { id: 28, title: "Doa Ketenangan Hati", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ نَفْسًا بِكَ مُطْمَئِنَّةً", latin: "Allahumma inni as-aluka nafsan bika muthmainnah", translation: "Ya Allah, aku memohon kepada-Mu jiwa yang tenang kepada-Mu.", category: "Harian" },
  { id: 29, title: "Doa Mensyukuri Nikmat", arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ", latin: "Rabbi auzi'ni an asykura ni'matakal lati an'amta 'alayya", translation: "Wahai Tuhanku, berilah aku ilham untuk tetap mensyukuri nikmat-Mu yang telah Engkau anugerahkan kepadaku.", category: "Harian" },
  { id: 30, title: "Doa Kafaratul Majlis", arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ أَشْهَدُ أَنْ لا إِلَهَ إِلا أَنْتَ أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ", latin: "Subhanakal-lahumma wa bihamdika asyhadu al-la ilaha illa anta astaghfiruka wa atubu ilaik", translation: "Maha Suci Engkau ya Allah, dan dengan memuji-Mu aku bersaksi bahwa tiada Tuhan selain Engkau, aku memohon ampun dan bertaubat kepada-Mu.", category: "Harian" }
];
