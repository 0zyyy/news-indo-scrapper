import MojokScrapper from "../src/mojok.co/scrape";

test("search", async () => {
    const ng = new MojokScrapper();
    const article = await ng.scrapeSections("esai",1);
    expect(article!.length).toBeGreaterThanOrEqual(1);
})