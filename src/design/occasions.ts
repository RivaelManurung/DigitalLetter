import type { SectionType } from './blocks';
import type { SectionStyle } from './types';

/**
 * Occasion = susunan section awal untuk satu jenis acara, plus preset desain
 * yang cocok. Ini murni DATA: menambah occasion tidak menyentuh kode mana pun,
 * cukup menambah entri di sini.
 *
 * Yang dipilih user di dialog "Surat baru" menentukan section apa saja yang
 * dibuat — sisanya tetap bisa ditambah/dihapus manual di tab Konten.
 */

export type OccasionBlueprint = {
  label: string;
  /** satu kalimat di bawah nama, menjelaskan isinya */
  note: string;
  /** id preset dari design/presets */
  preset: string;
  /** urutan section yang dibuat untuk surat baru */
  sections: SectionType[];
  /** naskah awal yang menimpa starter block (per field); sisanya tetap bawaan */
  content?: Partial<Record<SectionType, Record<string, unknown>>>;
  /** tampilan awal per section, mis. foto latar hero */
  style?: Partial<Record<SectionType, SectionStyle>>;
};

export const OCCASIONS = {
  love: {
    label: 'Surat Cinta',
    note: 'Surat romantis dengan alasan, taman bunga, dan galeri foto.',
    preset: 'dark-romantic',
    sections: ['intro', 'hero', 'letter', 'reasons', 'garden', 'gallery', 'finale'],
  },

  wedding: {
    label: 'Undangan Pernikahan',
    note: 'Mempelai, akad & resepsi, hitung mundur, rundown, amplop digital, dan RSVP.',
    preset: 'golden-hour',
    sections: [
      'intro',
      'hero',
      'quote',
      'couple',
      'event',
      'countdown',
      'itinerary',
      'story',
      'gallery',
      'gift',
      'rsvp',
      'finale',
    ],
  },

  confess: {
    label: 'Pernyataan Cinta',
    note: 'Pengakuan perasaan, alasan suka, kenangan, dan pertanyaan ya/tidak.',
    preset: 'midnight-ink',
    sections: ['intro', 'hero', 'letter', 'reasons', 'memories', 'question', 'finale'],
  },

  valentine: {
    label: 'Hari Valentine',
    note: 'Kartu valentine dengan alasan cinta, kutipan, dan galeri.',
    preset: 'dark-romantic',
    sections: ['intro', 'hero', 'letter', 'reasons', 'quote', 'gallery', 'garden', 'finale'],
  },

  birthday: {
    label: 'Ulang Tahun',
    note: 'Ucapan, daftar harapan, hitung mundur, dan kenangan.',
    preset: 'golden-hour',
    sections: ['intro', 'hero', 'wish', 'memories', 'gallery', 'countdown', 'finale'],
  },

  christmas: {
    label: 'Natal',
    note: 'Dibuka dengan chat tengah malam, lalu tumpukan kado yang dibuka satu per satu, surat, dan hitung mundur.',
    preset: 'christmas-eve',
    sections: ['intro', 'hero', 'chat', 'unwrap', 'letter', 'reasons', 'countdown', 'gallery', 'finale'],
    content: {
      hero: {
        eyebrow: "selamat natal",
        titleTop: "Natal Ini,",
        titleBottom: "Kamu Kadonya",
        subtitle: "Di antara lampu yang berkedip dan lagu yang diputar berulang-ulang, aku menulis ini untuk satu orang yang membuat tahun ini terasa seperti pulang."
      },
      chat: {
        eyebrow: "24 desember, 23.58",
        messages: [
          {
            from: "aku",
            text: "Kamu udah tidur?"
          },
          {
            from: "kamu",
            text: "Belum. Lagi bungkus kado, selotipnya nempel di mana-mana 😩"
          },
          {
            from: "aku",
            text: "Hahaha pantes. Dua menit lagi jam dua belas."
          },
          {
            from: "aku",
            text: "Aku sengaja nunggu dari tadi, biar jadi yang pertama."
          },
          {
            from: "kamu",
            text: "Yang pertama apa?"
          },
          {
            from: "aku",
            text: "Yang pertama bilang selamat Natal ke kamu tahun ini. Semoga tahun-tahun berikutnya juga."
          },
          {
            from: "kamu",
            text: "Ih… 🥹"
          },
          {
            from: "aku",
            text: "Scroll ke bawah ya. Aku siapin sesuatu buat kamu 🎁"
          }
        ]
      },
      unwrap: {
        eyebrow: "di bawah pohon",
        title: "Tiga Kado Kecil untukmu",
        doneNote: "Tiga kado sudah terbuka. Yang keempat tidak bisa dibungkus: aku, yang bersyukur setiap hari karena kamu ada.",
        items: [
          {
            tag: "Buka dulu",
            title: "Kupon Peluk Tanpa Batas",
            body: "Berlaku kapan saja: saat kamu capek pulang kerja, saat kamu kesal tanpa alasan, atau saat kamu cuma butuh diam berdua. Tidak perlu alasan untuk menukarnya.",
            photoId: ""
          },
          {
            tag: "Yang ini",
            title: "Satu Malam Keliling Lampu Kota",
            body: "Kita jalan pelan-pelan menyusuri lampu Natal, beli cokelat panas di pinggir jalan, lalu pulang dengan tangan yang saling menghangatkan. Kamu yang pilih rutenya.",
            photoId: ""
          },
          {
            tag: "Terakhir",
            title: "Sebuah Janji",
            body: "Natal tahun depan, dan tahun-tahun sesudahnya, aku ingin tetap jadi orang yang duduk di sebelahmu saat lampu pohon dinyalakan.",
            photoId: ""
          }
        ]
      },
      letter: {
        label: "surat natal",
        title: "Tahun ini, rumah terasa paling hangat karena ada kamu.",
        body: "Aku ingat Desember tahun lalu, waktu semuanya terasa terburu-buru dan aku lupa caranya menikmati hal kecil. Lalu kamu datang dengan kebiasaan-kebiasaanmu: menyalakan lampu kecil di pojok kamar, menyanyikan lagu Natal dengan nada yang tidak pernah pas, dan memaksaku berhenti sebentar untuk minum cokelat panas yang selalu kebanyakan gula.\n\nHal-hal itu terlihat sederhana, tapi pelan-pelan mengajariku bahwa bahagia bukan sesuatu yang harus dikejar. Ia ada di meja makan yang ramai, di pesan singkat \"sudah sampai rumah?\", dan di caramu tetap sabar waktu aku sedang sulit dihadapi.\n\nNatal ini aku tidak punya kado yang cukup besar untuk membalas semua itu. Yang bisa kuberikan hanya ini: perhatian yang tidak setengah-setengah, telinga yang selalu mau mendengar, dan doa yang selalu menyebut namamu.\n\nSelamat Natal, sayang. Semoga damai yang kita rayakan malam ini tinggal lebih lama dari lampu-lampunya.",
        signature: "— Dengan seluruh hatiku"
      },
      reasons: {
        eyebrow: "yang kusyukuri",
        title: "Hal-Hal Kecil yang Membuat Tahun Ini Berarti",
        items: [
          {
            icon: "star",
            title: "Caramu mendengarkan",
            body: "Kamu tidak pernah buru-buru memberi nasihat. Kamu mendengarkan sampai ceritaku selesai, dan entah kenapa itu saja sudah cukup menyembuhkan."
          },
          {
            icon: "heart",
            title: "Pesan \"sudah makan?\"",
            body: "Pertanyaan kecil yang kamu kirim setiap hari, bahkan di hari tersibukmu. Itu caramu bilang aku penting, tanpa perlu kata-kata besar."
          },
          {
            icon: "sparkle",
            title: "Tawamu yang lepas",
            body: "Kamu tertawa tanpa menahan diri, dan setiap kali itu terjadi, aku merasa dunia sedang baik-baik saja."
          },
          {
            icon: "leaf",
            title: "Kesabaranmu",
            body: "Kamu tetap tinggal di hari-hari ketika aku sendiri sulit menyukai diriku. Aku tidak akan pernah lupa itu."
          }
        ]
      },
      countdown: {
        eyebrow: "sebentar lagi",
        title: "Menuju Malam Natal",
        targetAt: "2026-12-24T18:00",
        passedLabel: "Selamat Natal. Terima kasih sudah jadi bagian terbaik tahun ini. 🎄"
      },
      gallery: {
        eyebrow: "tahun yang kita lewati",
        title: "Potret yang Ingin Kusimpan Selamanya"
      },
      memories: {
        eyebrow: "tahun yang indah",
        title: "Kenangan Tahun Ini"
      },
      finale: {
        eyebrow: "selamat natal",
        title: "Merry Christmas, Sayang",
        body: "Lampu-lampu ini akan dimatikan, pohonnya akan dibongkar, dan Desember akan berganti. Tapi rasa syukurku karena kamu ada tidak ikut disimpan di dalam kardus. Ia tetap menyala setiap hari, sampai Natal berikutnya, dan Natal-Natal sesudahnya.",
        signature: "Dengan cinta, dari aku"
      }
    },
  },

  'christmas-couple': {
    label: 'Natal untuk Pasangan',
    note: 'Untuk pasangan: gosok jendela berembun untuk melihat fotomu, surat, kenangan, dan pertanyaan manis di akhir.',
    preset: 'winter-frost',
    style: { hero: { bgImage: '/image/berdua-hero.webp', bgOverlay: 0.6 } },
    sections: ['intro', 'hero', 'scratch', 'letter', 'memories', 'quote', 'question', 'finale'],
    content: {
      hero: {
        eyebrow: "natal berdua",
        titleTop: "Dinginnya Salju,",
        titleBottom: "Hangatnya Kamu",
        subtitle: "Di luar, kota sedang membeku. Di sini, aku menulis surat ini dengan tangan yang masih hangat karena baru saja menggenggammu."
      },
      scratch: {
        eyebrow: "ada sesuatu di balik kaca",
        title: "Hapus Embunnya Pelan-Pelan",
        message: "Aku di sini, di balik jendela yang berembun, menunggu Natal bersamamu. Seperti tahun lalu, dan seperti yang kuharap terjadi lagi tahun depan."
      },
      letter: {
        label: "untuk kekasihku",
        title: "Di luar dingin, tapi di dekatmu aku selalu merasa pulang.",
        body: "Aku tidak butuh pohon yang paling tinggi atau kado yang paling mahal. Yang kuinginkan Natal ini sederhana sekali: duduk di sebelahmu dengan satu selimut untuk berdua, mendengarkan lagu Natal yang sama diputar ulang, dan melihat salju turun sementara kamu menyandarkan kepala di bahuku.\n\nKamu mungkin tidak sadar, tapi kamu punya cara membuat hal biasa terasa istimewa. Teh yang terlalu manis jadi enak karena kamu yang membuat. Jalan kaki di udara dingin jadi menyenangkan karena kamu menggenggam tanganku lalu memasukkannya ke saku jaketmu.\n\nTahun ini tidak selalu mudah untuk kita. Ada hari kita salah paham, ada minggu kita sama-sama lelah. Tapi setiap kali, kita memilih untuk kembali duduk dan bicara. Bagiku, itu kado paling berharga yang pernah kuterima.\n\nTerima kasih sudah memilihku, di musim ini dan semoga di semua musim yang akan datang.",
        signature: "— Milikmu, selalu"
      },
      memories: {
        eyebrow: "yang tak terlupakan",
        title: "Momen-Momen Kecil Kita",
        items: [
          {
            title: "Pertama kali kamu tertawa karena aku",
            date: "",
            body: "Leluconku sebenarnya tidak lucu. Tapi kamu tertawa sampai menutup muka, dan sejak hari itu aku diam-diam ingin membuatmu tertawa seumur hidup.",
            photoId: ""
          },
          {
            title: "Hujan di halte itu",
            date: "",
            body: "Kita terjebak hujan tanpa payung dan menunggu hampir satu jam. Aku tidak ingat obrolannya, tapi aku ingat aku berharap hujannya tidak cepat reda.",
            photoId: ""
          },
          {
            title: "Natal pertama kita",
            date: "",
            body: "Kadomu terbungkus berantakan dan kartunya ditulis terburu-buru. Sampai sekarang kartu itu masih kusimpan di laci, di bawah barang-barang yang paling kujaga.",
            photoId: ""
          }
        ]
      },
      quote: {
        text: "Aku tidak tahu akan seperti apa tahun depan. Tapi kalau boleh memilih, aku ingin melewati setiap Desember dengan menggenggam tanganmu.",
        source: "Janjiku untukmu",
        translation: ""
      },
      question: {
        eyebrow: "satu pertanyaan kecil",
        title: "Maukah kamu merayakan Natal berikutnya bersamaku?",
        body: "Dan yang sesudahnya. Dan yang sesudahnya lagi. Sampai kita lupa sudah berapa kali menghias pohon bersama.",
        yesLabel: "Mau, dong!",
        yesResponse: "Sudah kucatat di kalender, dengan tinta yang tidak bisa dihapus. Terima kasih sudah bilang iya. 🎄💛"
      },
      finale: {
        eyebrow: "selamat natal",
        title: "Terima Kasih Sudah Jadi Kadoku",
        body: "Salju akan mencair dan lampu-lampu akan dipadamkan. Tapi aku ingin kamu tahu: perasaanku padamu bukan perayaan musiman. Ia ada di hari Senin yang membosankan, di bulan-bulan yang sibuk, dan di semua hari biasa yang kita jalani berdua.",
        signature: "Dari yang selalu mencintaimu"
      }
    },
  },

  anniversary: {
    label: 'Hari Jadi',
    note: 'Perjalanan berdua dengan langit berbintang, cerita, kenangan, dan surat penutup.',
    preset: 'starlit-couple',
    sections: ['intro', 'hero', 'story', 'memories', 'letter', 'garden', 'gallery', 'finale'],
    content: {
      hero: {
        eyebrow: "hari jadi kita",
        titleTop: "Bersamamu,",
        titleBottom: "Setiap Hari Istimewa",
        subtitle: "Satu tahun lagi kita lewati berdua. Di bawah langit yang sama, aku masih memilihmu, dengan alasan yang setiap hari bertambah."
      },
      story: {
        eyebrow: "perjalanan kita",
        title: "Dari Awal Sampai Hari Ini",
        items: [
          {
            date: "Awal",
            title: "Pertemuan yang tidak direncanakan",
            body: "Kita bertemu di hari yang biasa saja. Tidak ada tanda-tanda bahwa orang di depanku akan jadi nama yang paling sering kusebut dalam doa.",
            photoId: ""
          },
          {
            date: "Beberapa bulan kemudian",
            title: "Pesan yang tidak pernah berhenti",
            body: "Obrolan singkat berubah jadi telepon sampai larut. Kita membicarakan semuanya, dari hal-hal konyol sampai ketakutan yang belum pernah kuceritakan ke siapa pun.",
            photoId: ""
          },
          {
            date: "Hari ini",
            title: "Masih kamu",
            body: "Kita sudah melihat versi terbaik dan terburuk satu sama lain. Dan setelah semua itu, aku masih ingin pulang ke kamu.",
            photoId: ""
          }
        ]
      },
      memories: {
        eyebrow: "terekam di ingatan",
        title: "Yang Selalu Kuingat",
        items: [
          {
            title: "Perjalanan tanpa rencana",
            date: "",
            body: "Kita salah ambil jalan, kehabisan sinyal, lalu makan di warung pinggir jalan. Hari itu jadi salah satu hari paling bahagia yang pernah kupunya.",
            photoId: ""
          },
          {
            title: "Malam kita menghitung bintang",
            date: "",
            body: "Kamu menunjuk bintang paling terang dan bilang itu milik kita. Aku tidak pernah bilang, tapi sejak malam itu aku selalu mencarinya setiap kali melihat langit.",
            photoId: ""
          }
        ]
      },
      letter: {
        label: "di hari kita",
        title: "Terima kasih sudah bertahan, dan memilihku lagi setiap hari.",
        body: "Kalau aku melihat ke belakang, perjalanan kita tidak selalu mulus. Ada hari-hari ketika kita sama-sama keras kepala, ada malam ketika kita tidur dengan perasaan yang belum selesai. Tapi kita selalu kembali, duduk berdua, dan mencoba mengerti satu sama lain lagi.\n\nAku belajar banyak darimu. Tentang sabar yang tidak berisik, tentang meminta maaf tanpa gengsi, tentang mencintai seseorang lengkap dengan bagian-bagian dirinya yang belum selesai. Kamu membuatku jadi versi diriku yang lebih baik, tanpa pernah memaksaku berubah.\n\nHari ini aku tidak ingin merayakan berapa lama kita sudah bersama. Aku ingin merayakan kenyataan bahwa setelah semua yang terjadi, kita masih saling memilih.\n\nSelamat hari jadi, sayang. Ayo terus tumbuh berdua, pelan-pelan, sampai kita tua dan masih saling mengirim pesan \"sudah makan belum?\".",
        signature: "— Kekasihmu, hari ini dan seterusnya"
      },
      garden: {
        eyebrow: "seikat untukmu",
        title: "Satu Bunga untuk Tiap Hal yang Kusyukuri",
        note: "sentuh tiap bunga untuk membaca maknanya",
        flowers: [
          {
            flower: "rose",
            name: "Mawar",
            meaning: "Cinta yang tetap merah setelah sekian lama"
          },
          {
            flower: "sakura",
            name: "Sakura",
            meaning: "Hari pertama kita bertemu"
          },
          {
            flower: "sunflower",
            name: "Bunga Matahari",
            meaning: "Kamu yang selalu menghadap ke arahku"
          },
          {
            flower: "tulip",
            name: "Tulip",
            meaning: "Bahagia sederhana di hari-hari biasa"
          },
          {
            flower: "lotus",
            name: "Teratai",
            meaning: "Kita yang tetap tumbuh di masa sulit"
          }
        ]
      },
      gallery: {
        eyebrow: "kita, dalam gambar",
        title: "Potongan Waktu yang Kita Punya"
      },
      finale: {
        eyebrow: "selamanya, ya?",
        title: "Aku Pilih Kamu, Lagi dan Lagi",
        body: "Di bawah langit yang sama tempat kita dulu menghitung bintang, aku ingin berjanji satu hal: apa pun yang datang tahun depan, aku akan tetap di sini. Menggenggam tanganmu, mendengarkan ceritamu, dan merayakan setiap hari biasa bersamamu.",
        signature: "Selamat hari jadi"
      }
    },
  },

  'dinner-date': {
    label: 'Undangan Makan Malam',
    note: 'Ajakan makan malam berdua: surat, alasan, hitung mundur ke malamnya, dan pertanyaan "mau?" di akhir.',
    preset: 'rose-gold-couple',
    sections: ['intro', 'hero', 'letter', 'reasons', 'countdown', 'question', 'finale'],
    content: {
      hero: {
        eyebrow: "satu malam untuk kita",
        titleTop: "Lilin Sudah Menyala,",
        titleBottom: "Tinggal Kamu",
        subtitle: "Mawar sudah di meja dan kursi di depanku sengaja kubiarkan kosong. Hanya ada satu orang yang kuharap duduk di sana."
      },
      letter: {
        label: "undangan kecil",
        title: "Aku ingin satu malam yang pelan, hanya untuk kita berdua.",
        body: "Belakangan ini kita sama-sama sibuk. Kita bertemu, tapi sering sambil memikirkan pekerjaan besok. Kita mengobrol, tapi sering terpotong notifikasi. Aku rindu kita yang dulu bisa duduk berjam-jam tanpa melihat jam.\n\nJadi aku menyiapkan satu malam. Tempatnya tenang, lampunya temaram, dan menunya kupilih dari hal-hal yang pernah kamu bilang ingin coba. Tidak ada agenda apa pun selain menikmati waktu bersamamu.\n\nKamu tidak perlu membawa apa-apa. Datang saja dengan senyummu yang biasa, ceritamu tentang minggu ini, dan tawamu yang selalu membuat suasana jadi hangat.",
        signature: "— Yang menunggumu di meja"
      },
      reasons: {
        eyebrow: "kenapa malam ini",
        title: "Alasan Aku Mengajakmu",
        items: [
          {
            icon: "heart",
            title: "Aku rindu ngobrol lama",
            body: "Bukan sekadar bertukar kabar, tapi bicara sampai lupa waktu, seperti di awal-awal kita dulu."
          },
          {
            icon: "sparkle",
            title: "Kamu pantas dirayakan",
            body: "Minggu-minggu ini kamu bekerja keras dan jarang mengeluh. Malam ini giliranmu untuk dimanja."
          },
          {
            icon: "star",
            title: "Terima kasih yang tertunda",
            body: "Untuk semua hal kecil yang kamu lakukan tanpa diminta, dan yang sering terlewat tanpa kusadari."
          },
          {
            icon: "leaf",
            title: "Karena kita butuh jeda",
            body: "Hubungan bukan hanya dijalani, tapi juga dirawat. Satu malam berdua adalah caraku merawat kita."
          }
        ]
      },
      countdown: {
        eyebrow: "catat tanggalnya",
        title: "Menuju Malam Kita",
        targetAt: "2026-11-14T19:00",
        passedLabel: "Malamnya sudah tiba. Lilin sudah menyala, dan aku menunggumu. 🕯️"
      },
      question: {
        eyebrow: "jadi, bagaimana?",
        title: "Mau makan malam bersamaku?",
        body: "Sabtu, jam tujuh malam. Aku yang menjemputmu, dan aku janji kali ini tidak telat.",
        yesLabel: "Mau!",
        noLabel: "Nanti dulu",
        noBehavior: "dodge",
        yesResponse: "Terima kasih sudah bilang iya. Pakai baju yang paling membuatmu nyaman, ya. Sisanya serahkan padaku. 🌹"
      },
      finale: {
        eyebrow: "sampai jumpa",
        title: "Kursi di Depanku Selalu Milikmu",
        body: "Malam ini, dan malam-malam berikutnya. Di restoran yang tenang atau di warung tenda pinggir jalan, yang membuatnya istimewa bukan tempatnya, tapi kamu yang duduk di seberang meja.",
        signature: "Dengan cinta, dari aku"
      }
    },
  },

  apology: {
    label: 'Permintaan Maaf',
    note: 'Surat permintaan maaf dengan cerita dan janji perbaikan.',
    preset: 'midnight-ink',
    sections: ['intro', 'hero', 'letter', 'story', 'quote', 'finale'],
  },
} satisfies Record<string, OccasionBlueprint>;

export type OccasionId = keyof typeof OCCASIONS;

export const OCCASION_IDS = Object.keys(OCCASIONS) as OccasionId[];

export function isOccasionId(value: unknown): value is OccasionId {
  return typeof value === 'string' && value in OCCASIONS;
}
