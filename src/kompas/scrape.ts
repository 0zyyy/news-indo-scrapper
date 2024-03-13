import axios from "axios";
import * as cheerio from "cheerio";

export default class KompasScrapper {
  host: string;
  articles: Article[];
  constructor() {
    this.host = `https://indeks.kompas.com/?`;
    this.articles = [];
  }

  async getUrl(query: string, date?: string): Promise<cheerio.CheerioAPI> {
    const resp = await axios.get(
      this.host + `site=${query}&date=${date ?? ""}`
    );
    return cheerio.load(resp.data);
  }

  async getArticles(query: string, date?: string): Promise<Article[]> {
    try {
      const page = await this.getUrl(query, date);
      const articleList = page(".articleList").find(".articleItem");

      articleList.each((_, element) => {
        this.articles.push({
          title: page(element).find("h2.articleTitle").text(),
          category: page(element).find("div.articlePost-subtitle").text(),
          publish_date: page(element).find("div.articlePost-date").text(),
          article_url:
            page(element).find("a.article-link").attr("href") ??
            "No link provided",
        });
      });

      return this.articles;
    } catch (e) {
      console.log(e);
      throw new Error("Cannot get articles");
    }
  }

  async getContentArticle(article_url: string): Promise<Article> {
    try {
      const resp = await axios.get(article_url, {
        headers: {
          // "Host": "https://indeks.kompas.com",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.71 Safari/537.36",
        },
      });

      const page = cheerio.load(resp.data);
      const script = page("script:not([src])").filter(function (i, elem) {
        return page(this).html()!.includes("var keywordBrandSafety");
      });
      const scriptTag = page("script")
        .filter(function () {
          return page(this).html()!.includes("window.dataLayer.push");
        })
        .html();
    
      // Extract the pushed data (JSON string)
      const jsonData = scriptTag?.match(/window\.dataLayer\.push\((.*)\);/s)![1];

      // Parse the JSON string to a JavaScript object
      const pushedData = JSON.parse(jsonData!);
      const content = this.extractContent(script);
    
      return {
        title: pushedData["content_title"],
        category: pushedData["content_subcategory"],
        content: content,
        author: pushedData["content_author"],
        publish_date: pushedData["content_PublishedDate"],
        article_url: article_url,
      };
    } catch (e) {
      console.log(e);
      throw new Error("Cannot get content of article");
    }
  }

  extractContent(content: cheerio.Cheerio<cheerio.Element>) {
    const regex = /Baca juga: .*/g;
    const ads1 = /Dapatkan update berita .*/g;
    const ads2 = /Mari bergabung .*/g;
    const ads3 = /Anda harus install .*/g;
    // Extract the variable using regular expression
    const regexKeyword = /var keywordBrandSafety = "([^"]*)";/;
    const match = content.html()!.match(regexKeyword);

    // Extracted variable value
    const extractedVariable = match ? match[1] : null;

    const extractedParagraphs = extractedVariable
      ?.split(". ")
      .map((p) =>
        p
          .replace(regex, "")
          .replace(ads1, "")
          .replace(ads2, "")
          .replace(ads3, "")
          .replace("&quot;", '"')
      );
    const joinedParagraphs = extractedParagraphs
      ?.filter((p) => p != "")
      .join("\r\n");
    return joinedParagraphs;
  }
}
