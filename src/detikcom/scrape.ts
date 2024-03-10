import axios from "axios";
import * as cheerio from "cheerio";
import * as CONST from "./const";

type Article = {
  title: string;
  category: string;
  author?: string,
  img_url?: string | "",
  content?: string | "",
  publish_date: string;
  article_url: string;
};
export default class DetikScrapper {
  async getUrl(
    query: any,
    category_id?: any,
    date_start?: number,
    date_end?: undefined,
    pages_num = 1
  ): Promise<cheerio.CheerioAPI> {
    try {
      const url = `https://www.detik.com/search/searchall?query=${query}&siteid=${category_id}&sortby=time&fromdatex=${date_start}&todatex=${date_end}&page=${pages_num}`;
      const resp = await axios.get(url);
      console.log(resp.data);
      return cheerio.load(resp.data);
    } catch (e) {
      throw new Error("Failed to fetch the url");
    }
  }

  async searchResult(
    query: any,
    category_id?: any,
    date_start?: number,
    date_end?: undefined
  ) {
    const page = await this.getUrl(query, category_id, date_start, date_end);
    console.log("TESTING");
    console.log(page("div.list-berita"));
    console.log("TESTING");
  }

  async getArticles(query: string, category_id?: number, page_num = 1): Promise<Article[]> {
    let articles_list: Article[] = [];
    try {
      const page = await this.getUrl(query, category_id, (page_num = page_num));
      const articles = page("article");
      articles.each((_index, element) => {
        let title = page(element).find("h2.title").text();
        let category = page(element).find("span.category").text();
        let publish_data = page(element)
          .find("span.date")
          .text()
          .split(category)[1];
        let article_url = page(element).find("a").attr("href") ?? "";

        articles_list.push({
          title: title,
          category: category,
          publish_date: publish_data,
          article_url: article_url,
        });
      });
      return articles_list;
    } catch (e) {
      throw new Error("Cannot get articles");
    }
  }

  async getContentArticle(article_url: string): Promise<Article | undefined>{
    try{
        let resp = await axios.get(article_url);
        let page = cheerio.load(resp.data);
        let content_list = [];
        let multiple_page = page('div.detail__multiple');

        const header = page("article").find("div.detail__header");
        const title = page(header).find("h1.detail__title").text();
        const author = page(header).find("div.detail__author").text();
        const category = page(header).find("span.detail__label").text();
        const date = page(header).find("div.detail__date").text();
        if(multiple_page.length > 0){
            console.log("Multiple")
            let pageLinks = multiple_page.find('a').map((_, element) => {
                return page(element).attr('href');
            }).get().slice(0, -1);
            for (let page of pageLinks) {
                let response = await axios.get(page);
                let content_page = cheerio.load(response.data);
    
                content_list.push(...content_page('p').map((index, element) => {
                    let text = content_page(element).text();
                    return text.trim();
                }).get().filter(text => {
                    return !text.startsWith('\n\n\n\nHalaman\n\n') &&
                           !['', '[Gambas:Instagram]', '[Gambas:Video 20detik]',
                           'ADVERTISEMENT', ' ADVERTISEMENT',
                           ' SCROLL TO CONTINUE CONTENT',
                           'Selengkapnya di halaman selanjutnya.',
                           'Ayo share cerita pengalaman dan upload photo album travelingmu di sini.Silakan Daftar atau Masuk'].includes(text);
                }));
            }
        }else{
            content_list.push(page('p').map((index, element) => {
                return page(element).text().trim();
            }).get().filter(text => {
                return !text.startsWith('\n\n\n\nHalaman\n\n') &&
                           !['', '[Gambas:Instagram]', '[Gambas:Video 20detik]',
                           'ADVERTISEMENT', ' ADVERTISEMENT',
                           ' SCROLL TO CONTINUE CONTENT',
                           ',SCROLL TO CONTINUE CONTENT,',
                           'Selengkapnya di halaman selanjutnya.',
                           'Ayo share cerita pengalaman dan upload photo album travelingmu di sini.Silakan Daftar atau Masuk'].includes(text);
            }));
        }
        return {
            title: title.trim(),
            author: author,
            content: content_list.join("\r\n"),
            category: category,
            publish_date: date,
            article_url: article_url,
        };
    }catch(e){
        console.log(e);
        throw new Error("Can't parse article");
    }
  }
}

const ng = new DetikScrapper();
ng.getContentArticle("https://news.detik.com/berita/d-7231768/bareskrim-periksa-rosan-soal-dugaan-pencemaran-nama-baik-oleh-connie-bakrie").then((resp) => console.log(resp?.content));
