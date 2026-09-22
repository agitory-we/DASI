import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mqqkbudvnrlpexkonlyp.supabase.co';
const supabaseKey = 'sb_publishable_QaJbxq7lKASow7lpdZUzfw_D2QFuPxS';

const supabase = createClient(supabaseUrl, supabaseKey);

const govVerifiedSpots = [
  // 1. ?꾩?濡쑣룹땐臾대줈 (以묎뎄)
  {
    id: 'spot-euljiro-mangwoo',
    name: '留앹슦?쇰┝ (恙섉냲汝?옑)',
    category: 'lab',
    is_micro_ad_partner: true,
    partner_badge_text: 'DASI ?⑤룆 1濡?臾대즺 ?ㅼ틪',
    address: '?쒖슱?밸퀎??以묎뎄 ?꾩?濡?108 3痢?,
    area: '?꾩?濡?,
    lat: 37.5663,
    lng: 126.9922,
    contact: '02-2266-3390',
    open_hours: '11:00 - 19:00 (?섏슂???대Т)',
    today_scan_cutoff: '?ㅻ뒛 17:30 留덇컧 ???뱀씪 21:00 ?꾩넚',
    film_stock_status: '肄붾떏 ?명듃?쇰㎘??00, ?꾩? 200 ?ш퀬 ?ъ쑀',
    scanner_types: ['Fuji Frontier SP3000', 'Noritsu HS-1800'],
    sample_color_tone_images: [
      {
        scannerName: '?꾩? ?꾨줎?곗뼱 SP3000',
        imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80',
        toneDescription: '?곕쑜?섍퀬 遺?쒕윭??洹몃┛쨌?뚯뒪?????쒗쁽. ?몃Ъ 諛??먯뿰 ?띻꼍 異붿쿇'
      },
      {
        scannerName: '?몃━痢?HS-1800',
        imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
        toneDescription: '?믪? ?댁긽?κ낵 吏꾪븯怨??좊챸??留덉젨?쨌肄섑듃?쇱뒪?? ?쇨꼍 諛??ㅽ듃由ы듃 ?ъ쭊 異붿쿇'
      }
    ],
    promo_notice: 'DASI ???뚯썝 ?꾩옣 諛붿퐫???쒖떆 ???꾨쫫 1濡?臾대즺 ?ㅼ틪 諛붿슦泥??곸슜',
    is_gov_verified: true,
    sub_tags: ['?뱀씪?ㅼ틪', '?꾩?', '?몃━痢?, 'DASI?쒗쑕'],
    rating: 4.9,
    reviews_count: 248
  },
  {
    id: 'spot-chungmuro-whale',
    name: '怨좊옒?ъ쭊愿',
    category: 'lab',
    is_micro_ad_partner: false,
    partner_badge_text: null,
    address: '?쒖슱?밸퀎??以묎뎄 異⑸Т濡?3媛 25-5 3痢?,
    area: '異⑸Т濡?,
    lat: 37.5627,
    lng: 126.9942,
    contact: '02-2269-7770',
    open_hours: '12:00 - 20:00 (?곗쨷臾댄쑕)',
    today_scan_cutoff: '?먭? ?ㅼ틪 醫뚯꽍 ?ㅼ떆媛??덉빟 媛??,
    film_stock_status: '?쇳룷???묐갚 HP5, 肄붾떏 怨⑤뱶200 蹂댁쑀',
    scanner_types: ['Noritsu HS-1800', 'Fuji Frontier SP500'],
    sample_color_tone_images: [],
    promo_notice: '吏곸젒 ?ㅼ틦?덈? 議곗옉?섎ŉ ??痍⑦뼢?濡??됯컧??蹂댁젙?섎뒗 ????ㅼ틪 議??댁쁺',
    is_gov_verified: true,
    sub_tags: ['?뱀씪?ㅼ틪', '?먭??ㅼ틪', '?몃━痢?],
    rating: 4.8,
    reviews_count: 189
  },
  {
    id: 'spot-euljiro-color',
    name: '?꾩?移쇰씪',
    category: 'lab',
    is_micro_ad_partner: false,
    partner_badge_text: null,
    address: '?쒖슱?밸퀎??以묎뎄 異⑸Т濡?湲?19',
    area: '?꾩?濡?,
    lat: 37.5658,
    lng: 126.9918,
    contact: '02-2275-5544',
    open_hours: '10:00 - 19:30 (?좎슂??16:00 留덇컧)',
    today_scan_cutoff: '?뱀씪 18:00 ?묒닔 嫄닿퉴吏 ?뱀씪 ?대씪?곕뱶 ?꾩넚',
    film_stock_status: '而щ윭?뚮윭??200, ?쒕꽕?ㅽ떥 800T',
    scanner_types: ['Noritsu HS-1800'],
    sample_color_tone_images: [],
    promo_notice: '30??寃쎈젰??異⑸Т濡??명룷 而щ윭?? ?덉젙?곸씤 ?띾룄? ?좎냽???꾩긽',
    is_gov_verified: true,
    sub_tags: ['?뱀씪?ㅼ틪', '?몃━痢?, '怨좎냽?꾩넚'],
    rating: 4.7,
    reviews_count: 156
  },
  {
    id: 'spot-euljiro-13536',
    name: '?쇱궪?ㅼ궪??(135-36)',
    category: 'film_shop',
    is_micro_ad_partner: true,
    partner_badge_text: 'DASI 怨듭떇 ?쎌뾽 嫄곗젏',
    address: '?쒖슱?밸퀎??以묎뎄 ?섑몴濡?27 2痢?,
    area: '?꾩?濡?,
    lat: 37.5661,
    lng: 126.9895,
    contact: '02-2272-1353',
    open_hours: '12:00 - 20:00 (?붿슂???대Т)',
    today_scan_cutoff: '留ㅼ옣 ??24?쒓컙 ?꾨쫫 臾댁씤 ?쒕∼諛뺤뒪 ?댁쁺',
    film_stock_status: '?⑥쥌 ?꾨쫫 而щ젆?? ?щ쭏???묐갚',
    scanner_types: ['Noritsu'],
    sample_color_tone_images: [],
    promo_notice: '?ㅼ뼇??鍮덊떚吏 移대찓???≪꽭?쒕━? ?꾩긽 ?묒닔 ?쒕∼諛뺤뒪 ?곸떆 媛??,
    is_gov_verified: true,
    sub_tags: ['24?쒖옄?먭린', '?꾨쫫援щℓ', 'DASI?쒗쑕'],
    rating: 4.8,
    reviews_count: 112
  },
  {
    id: 'spot-euljiro-shinseong',
    name: '?좎꽦移대찓??(?뺤씤??紐낆옣??',
    category: 'repair',
    is_micro_ad_partner: true,
    partner_badge_text: 'DASI ?몄쬆 1??紐낆옣??,
    address: '?쒖슱?밸퀎??以묎뎄 ?꾩?濡?2湲?15 2痢?,
    area: '?꾩?濡?,
    lat: 37.5659,
    lng: 126.9912,
    contact: '02-2274-0558',
    open_hours: '10:00 - 18:30 (?좎슂??15:00 留덇컧)',
    today_scan_cutoff: '鍮꾨?硫??앸같 ?섎━ 諛??뱀씪 10遺?利됱꽍 吏꾨떒 媛??,
    film_stock_status: '?섎━ 遺??蹂댁쑀??98% (?쇱씠移? 濡ㅻ씪?? ?덉퐯, ?щ┝?몄뒪)',
    scanner_types: [],
    sample_color_tone_images: [],
    promo_notice: '42??寃쎈젰 ?뺤씤??紐낆옣??1:1 ?ㅻ쾭? ?먭? 諛?遺??吏곸젒 媛怨?,
    is_gov_verified: true,
    sub_tags: ['?ㅻ쾭?', '40?꾨챸??, '?뱀씪?먭?', 'DASI?쒗쑕'],
    rating: 5.0,
    reviews_count: 215
  },
  {
    id: 'spot-chungmuro-daewoo',
    name: '??곗뭅硫붾씪',
    category: 'film_shop',
    is_micro_ad_partner: false,
    partner_badge_text: null,
    address: '?쒖슱?밸퀎??以묎뎄 ?닿퀎濡?197',
    area: '異⑸Т濡?,
    lat: 37.5615,
    lng: 126.9950,
    contact: '02-2274-1212',
    open_hours: '09:30 - 19:00 (?쇱슂???대Т)',
    today_scan_cutoff: '留ㅼ옣 ??以묎퀬 ?섎룞 ?꾨쫫 諛붾뵒 200??醫??곸떆 ?꾩떆',
    film_stock_status: '?섎룞 ?뚯쫰, 諛고꽣由? ?ㅽ듃?????덈ぉ ?꾨퉬',
    scanner_types: [],
    sample_color_tone_images: [],
    promo_notice: '異⑸Т濡쒕? ??쒗븯???대옒??移대찓???꾨Ц 嫄곕옒?? 留ㅼ엯 諛?蹂댁긽?먮ℓ',
    is_gov_verified: true,
    sub_tags: ['以묎퀬移대찓??, '?꾨쫫援щℓ'],
    rating: 4.6,
    reviews_count: 94
  },
  {
    id: 'spot-chungmuro-daehan-repair',
    name: '??쒖뭅硫붾씪?섎━??,
    category: 'repair',
    is_micro_ad_partner: false,
    partner_badge_text: null,
    address: '?쒖슱?밸퀎??以묎뎄 異⑸Т濡?媛 51-13',
    area: '異⑸Т濡?,
    lat: 37.5619,
    lng: 126.9928,
    contact: '02-2267-8890',
    open_hours: '10:00 - 18:00 (二쇰쭚 ?대Т)',
    today_scan_cutoff: '?뷀꽣留?援먯껜 諛??뚯쫰 怨고뙜???몄쿃 ?꾨Ц',
    film_stock_status: null,
    scanner_types: [],
    sample_color_tone_images: [],
    promo_notice: '湲곌퀎??移대찓??硫붿빱?덉쬁 ?섎━ 35??踰좏뀒???붿??덉뼱 ?곸＜',
    is_gov_verified: true,
    sub_tags: ['?ㅻ쾭?', '40?꾨챸??, '?뚯쫰?몄쿃'],
    rating: 4.8,
    reviews_count: 73
  },

  // 2. 醫낅줈 (?몄슫?곴?쨌?몄궗??
  {
    id: 'spot-jongno-photowith',
    name: '?ы넗?꾨뱶 醫낅줈??,
    category: 'lab',
    is_micro_ad_partner: false,
    partner_badge_text: null,
    address: '?쒖슱?밸퀎??醫낅줈援?醫낅줈 123 2痢?,
    area: '醫낅줈',
    lat: 37.5704,
    lng: 126.9902,
    contact: '02-763-1255',
    open_hours: '10:00 - 19:00 (?쇱슂???대Т)',
    today_scan_cutoff: '17:00 ?묒닔 ???뱀씪 20:00 諛쒖넚',
    film_stock_status: '肄붾떏, 耳꾪듃誘몄뼱 ?묐갚 ?ㅻ웾 蹂댁쑀',
    scanner_types: ['Noritsu HS-1800'],
    sample_color_tone_images: [],
    promo_notice: '醫낅줈 ?쇰? 異쒖궗媛앸뱾??利먭꺼 李얜뒗 ?덉젙?곸씤 而щ윭 ?꾩긽??,
    is_gov_verified: true,
    sub_tags: ['?뱀씪?ㅼ틪', '?몃━痢?],
    rating: 4.7,
    reviews_count: 88
  },
  {
    id: 'spot-sewoon-hyundai',
    name: '?꾨?移대찓??(?몄슫?ㅽ섏뼱)',
    category: 'film_shop',
    is_micro_ad_partner: false,
    partner_badge_text: null,
    address: '?쒖슱?밸퀎??醫낅줈援?李쎄꼍沅곷줈 109 ?몄슫?ㅽ섏뼱 蹂멸? 1痢?,
    area: '醫낅줈',
    lat: 37.5712,
    lng: 126.9985,
    contact: '02-2273-0404',
    open_hours: '10:00 - 18:30 (?쇱슂???대Т)',
    today_scan_cutoff: '?쇱씠移?M諛붾뵒, ?レ?釉붾씪??以묓삎 湲곌린 ?꾨Ц ?곷떞',
    film_stock_status: '120 以묓삎 ?꾨쫫, 35mm ??洹쒓꺽 痍④툒',
    scanner_types: [],
    sample_color_tone_images: [],
    promo_notice: '?몄슫?ㅽ섏뼱 ???愿묓븰 ?꾨Ц ?? ?섏씠?붾뱶 ?섎룞 湲곌린 ?꾨Ц 蹂댁쬆',
    is_gov_verified: true,
    sub_tags: ['以묎퀬移대찓??, '?섏씠?붾뱶'],
    rating: 4.8,
    reviews_count: 65
  },

  // 3. 留덊룷 (?곕궓쨌?띾?쨌留앹썝)
  {
    id: 'spot-yeonnam-film',
    name: '?곕궓?꾨쫫',
    category: 'lab',
    is_micro_ad_partner: true,
    partner_badge_text: 'DASI ?쒗쑕 ?レ뒪??,
    address: '?쒖슱?밸퀎??留덊룷援??숆탳濡?266-7 1痢?,
    area: '?띾?/?곕궓',
    lat: 37.5618,
    lng: 126.9255,
    contact: '02-332-9887',
    open_hours: '13:00 - 21:00 (?붿슂???대Т)',
    today_scan_cutoff: '二쇰쭚 19:00 留덇컧 嫄??뱀씪 ?밴갇?щ━ ?꾨떖',
    film_stock_status: '?ш? ?곹솕???꾨쫫(Cinestill), 媛먯꽦 援우쫰',
    scanner_types: ['Noritsu HS-1800', 'Fuji Frontier SP3000'],
    sample_color_tone_images: [],
    promo_notice: '?곕궓??怨⑤ぉ 媛먯꽦???댁? ?꾨뒔???쇱슫吏 & ?꾨쫫 ?명솕 怨듦컙',
    is_gov_verified: true,
    sub_tags: ['?뱀씪?ㅼ틪', '?꾩?', '?몃━痢?, 'DASI?쒗쑕'],
    rating: 4.9,
    reviews_count: 312
  },
  {
    id: 'spot-hongdae-filmlog-vending',
    name: '?꾨쫫濡쒓렇 24???먰뙋湲??띾???,
    category: 'film_shop',
    is_micro_ad_partner: false,
    partner_badge_text: null,
    address: '?쒖슱?밸퀎??留덊룷援???곗궛濡?29湲?48',
    area: '?띾?/?곕궓',
    lat: 37.5548,
    lng: 126.9288,
    contact: '1544-3882',
    open_hours: '24?쒓컙 ?곗쨷臾댄쑕 (臾댁씤 ?댁쁺)',
    today_scan_cutoff: '24?쒓컙 臾댁씤 ?꾩긽 ?섍굅???ㅼ튂',
    film_stock_status: '?낆궗?댄겢 ?좎씠移대찓?? ?묐갚/而щ윭 ?꾨쫫 24??寃곗젣 媛??,
    scanner_types: [],
    sample_color_tone_images: [],
    promo_notice: '諛ㅻ뒭? ?띾? 異쒖궗 以??꾨쫫???⑥뼱議뚯쓣 ???몄젣???댁슜?섎뒗 臾댁씤 ?ㅽ뀒?댁뀡',
    is_gov_verified: true,
    sub_tags: ['24?쒖옄?먭린', '?꾨쫫援щℓ'],
    rating: 4.7,
    reviews_count: 142
  },
  {
    id: 'spot-mangwon-photolab',
    name: '?ы넗??留앹썝',
    category: 'lab',
    is_micro_ad_partner: false,
    partner_badge_text: null,
    address: '?쒖슱?밸퀎??留덊룷援??ъ?濡?75 2痢?,
    area: '?띾?/?곕궓',
    lat: 37.5562,
    lng: 126.9048,
    contact: '02-3144-8899',
    open_hours: '12:00 - 19:30 (?섏슂???대Т)',
    today_scan_cutoff: '?뱀씪 ?ㅼ틪 ?묒닔 媛??,
    film_stock_status: '?щ쭏?? ?쇳룷?? 肄붾떏 而щ윭',
    scanner_types: ['Noritsu HS-1800'],
    sample_color_tone_images: [],
    promo_notice: '留앹썝?쒖옣 ?멸렐 議곗슜??怨⑤ぉ???꾨궇濡쒓렇 ?꾨쫫 ?꾩긽??,
    is_gov_verified: true,
    sub_tags: ['?뱀씪?ㅼ틪', '?몃━痢?],
    rating: 4.8,
    reviews_count: 98
  },

  // 4. ?깅룞 (?깆닔쨌?쒖슱??
  {
    id: 'spot-seongsu-archive',
    name: '?깆닔 ?꾨쫫 ?꾩뭅?대툕 & 24???먰뙋湲?,
    category: 'film_shop',
    is_micro_ad_partner: true,
    partner_badge_text: 'DASI 怨듭떇 ?쎌뾽 嫄곗젏',
    address: '?쒖슱?밸퀎???깅룞援??곕Т?κ만 36 1痢?,
    area: '?깆닔',
    lat: 37.5428,
    lng: 127.0545,
    contact: '02-468-7711',
    open_hours: '11:00 - 21:00 (?쇱쇅 ?먰뙋湲곕뒗 24?쒓컙)',
    today_scan_cutoff: '?쇱쇅 臾댁씤 ?꾨쫫 踰ㅻ뵫癒몄떊 & DASI ?뚰깉 ?쎌뾽',
    film_stock_status: '?꾩?, 肄붾떏, ?섎쭔 ?묐갚 ?쇳쉶??移대찓???곸떆 鍮꾩튂',
    scanner_types: [],
    sample_color_tone_images: [],
    promo_notice: '?깆닔???ロ뵆?덉씠??以묒떖???꾩튂???꾨궇濡쒓렇 ?덈툕. DASI 移대찓???꾩옣 ?쎌뾽 媛??,
    is_gov_verified: true,
    sub_tags: ['24?쒖옄?먭린', '以묎퀬移대찓??, 'DASI?쒗쑕'],
    rating: 4.9,
    reviews_count: 220
  },
  {
    id: 'spot-seoulforest-lab',
    name: '?쒖슱???ы넗洹몃씪????,
    category: 'lab',
    is_micro_ad_partner: false,
    partner_badge_text: null,
    address: '?쒖슱?밸퀎???깅룞援??쒖슱??湲?18-1 吏??1痢?,
    area: '?깆닔',
    lat: 37.5455,
    lng: 127.0422,
    contact: '02-499-1230',
    open_hours: '12:00 - 20:00 (?붿슂???대Т)',
    today_scan_cutoff: '17:00 ?묒닔 嫄??뱀씪 怨좏빐?곷룄 ?밴갇?щ━ ?꾨떖',
    film_stock_status: '?묓?100, ?ы듃??00 怨좉툒 ?ㅺ굅?곕툕 蹂댁쑀',
    scanner_types: ['Fuji Frontier SP3000'],
    sample_color_tone_images: [],
    promo_notice: '?쒖슱??異쒖궗 吏곹썑 諛붾줈 留↔만 ???덈뒗 媛먯꽦 ?꾩긽??,
    is_gov_verified: true,
    sub_tags: ['?뱀씪?ㅼ틪', '?꾩?'],
    rating: 4.8,
    reviews_count: 165
  }
];

async function seed() {
  console.log('Seeding gov-verified analog spots to Supabase...');
  for (const spot of govVerifiedSpots) {
    const { error } = await supabase
      .from('analog_spots')
      .upsert(spot, { onConflict: 'id' });

    if (error) {
      console.error('Error inserting spot ' + spot.name + ':', error.message);
    } else {
      console.log('??Inserted/Updated: ' + spot.name + ' (' + spot.area + ')');
    }
  }
  console.log('Finished seeding gov-verified analog spots!');
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});