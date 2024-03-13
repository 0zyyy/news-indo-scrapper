import DetikScrapper from "../src/detikcom/scrape";

type Article = {
    title: string;
    category: string;
    author?: string,
    img_url?: string | "",
    content?: string | "",
    publish_date: string;
    article_url: string;
};

test("search all article", async () => {
  const ng = new DetikScrapper();
  const articles = await ng.getArticles("nasional");
  expect(articles.length).toBeGreaterThanOrEqual(1);
});

test("content article",async () => {
    const ng = new DetikScrapper();
    const article = await ng.getContentArticle("https://oto.detik.com/berita/d-7235982/kecelakaan-truk-terulang-terus-banyak-sopir-yang-cuma-bisa-nyetir");
    expect(article).toMatchObject<Article>
    expect(article?.title).toBeTruthy
})
