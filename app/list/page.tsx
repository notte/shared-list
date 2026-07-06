import CardItem from "@/features/cards/components/server/CardItem"

const mockCards = [
  {
    cardId: "uuid-001",
    title: "台北故宮博物院參觀",
    description:
      "這是一個位於台北市中心的特色景點，結合了傳統文化與現代藝術，非常適合全家大小一起前來體驗，保證讓你留下深刻的美好回憶。",
    createdAt: new Date("2025-06-01"),
    createdBy: { userId: "u001", userName: "小明", color: "#6bb09c" },
    address: "台北市士林區至善路二段221號",
    publishTime: new Date("2025-06-01"),
    endTime: new Date("2025-07-01"),
    eventTime: new Date("2025-06-15"),
  },
  {
    cardId: "uuid-002",
    title: "陽明山花季健行",
    description:
      "沿著蜿蜒的山路緩緩前行，映入眼簾的是一片翠綠的茶園與遠山雲霧，微風輕拂帶來陣陣茶香，讓人瞬間忘卻城市的喧囂與疲憊。",
    createdAt: new Date("2025-06-02"),
    createdBy: { userId: "u002", userName: "小華", color: "#924011" },
    address: "台北市北投區陽明山國家公園",
    publishTime: new Date("2025-06-02"),
    endTime: new Date("2025-07-10"),
    eventTime: new Date("2025-06-20"),
  },
  {
    cardId: "uuid-003",
    title: "九份老街漫遊",
    description:
      "每逢週末這裡總是人聲鼎沸，各式各樣的街頭小吃攤販林立，從傳統古早味到創新料理應有盡有，絕對讓你大飽口福流連忘返。",
    createdAt: new Date("2025-06-03"),
    createdBy: { userId: "u001", userName: "小明", color: "#ae9e32" },
    address: "新北市瑞芳區九份老街",
    publishTime: new Date("2025-06-03"),
    endTime: new Date("2025-07-15"),
    eventTime: new Date("2025-06-22"),
  },
  {
    cardId: "uuid-004",
    title: "淡水老街美食之旅",
    description:
      "在這個隱身於城市巷弄之間的百年老街裡，每一塊斑駁的紅磚牆都訴說著屬於那個年代的故事，走在青石板路上彷彿能聽見歲月流逝的聲音，無論是在地居民還是遠道而來的旅人，都會被這份獨特的歷史氛圍深深吸引，流連忘返。",
    createdAt: new Date("2025-06-04"),
    createdBy: { userId: "u003", userName: "小美", color: "#92bf38" },
    address: "新北市淡水區中正路",
    publishTime: new Date("2025-06-04"),
    endTime: new Date("2025-07-20"),
    eventTime: new Date("2025-06-25"),
  },
  {
    cardId: "uuid-005",
    title: "烏來溫泉體驗",
    description: "泡湯放鬆，享受山林療癒時光",
    createdAt: new Date("2025-06-05"),
    createdBy: { userId: "u002", userName: "小華", color: "#777267" },
    address: "新北市烏來區溫泉街",
    publishTime: new Date("2025-06-05"),
    endTime: new Date("2025-07-25"),
    eventTime: new Date("2025-06-28"),
  },
  {
    cardId: "uuid-006",
    title: "基隆廟口夜市",
    description: "基隆必訪夜市，小吃種類豐富",
    createdAt: new Date("2025-06-06"),
    createdBy: { userId: "u003", userName: "小美", color: "#3dd213" },
    address: "基隆市仁愛區愛四路",
    publishTime: new Date("2025-06-06"),
    endTime: new Date("2025-08-01"),
    eventTime: new Date("2025-07-01"),
  },
  {
    cardId: "uuid-007",
    title: "平溪天燈節",
    description: "放天燈許願，體驗傳統民俗文化",
    createdAt: new Date("2025-06-07"),
    createdBy: { userId: "u001", userName: "小明", color: "#73f59a" },
    address: "新北市平溪區平溪老街",
    publishTime: new Date("2025-06-07"),
    endTime: new Date("2025-08-05"),
    eventTime: new Date("2025-07-05"),
  },
  {
    cardId: "uuid-008",
    title: "貓空纜車之旅",
    description: "搭乘纜車俯瞰台北盆地夜景",
    createdAt: new Date("2025-06-08"),
    createdBy: { userId: "u002", userName: "小華", color: "#609c66" },
    address: "台北市文山區指南路三段38巷33號",
    publishTime: new Date("2025-06-08"),
    endTime: new Date("2025-08-10"),
    eventTime: new Date("2025-07-10"),
  },
  {
    cardId: "uuid-009",
    title: "野柳地質公園",
    description: "探索奇特海蝕地形，認識自然奇觀",
    createdAt: new Date("2025-06-09"),
    createdBy: { userId: "u003", userName: "小美", color: "#24647c" },
    address: "新北市萬里區野柳里港東路167-1號",
    publishTime: new Date("2025-06-09"),
    endTime: new Date("2025-08-15"),
    eventTime: new Date("2025-07-15"),
  },
  {
    cardId: "uuid-010",
    title: "深坑老街豆腐之旅",
    description: "品嚐深坑特色臭豆腐與古早味小吃",
    createdAt: new Date("2025-06-10"),
    createdBy: { userId: "u001", userName: "小明", color: "#2bd9f8" },
    address: "新北市深坑區北深路三段老街",
    publishTime: new Date("2025-06-10"),
    endTime: new Date("2025-08-20"),
    eventTime: new Date("2025-07-20"),
  },
]

export default function Page() {
  return (
    <>
      {mockCards.map((card) => (
        <CardItem
          key={card.cardId}
          cardId={card.cardId}
          title={card.title}
          description={card.description}
          createdAt={card.createdAt}
          createdBy={card.createdBy}
        />
      ))}
    </>
  )
}
