import KompasScrapper from "../src/kompas/scrape";

test("get all articles", async () => {
    const ng = new KompasScrapper();
    const articles = await ng.getArticles("nasional");

    expect(articles.length).toBeGreaterThanOrEqual(1);
})