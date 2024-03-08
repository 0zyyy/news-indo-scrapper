import axios from "axios";
import * as cheerio from "cheerio";

export default class MojokScrapper {
  async scrapeSections(jenis_halam, jml_hal) {
    const mojokSection = [
      "esai",
      "liputan",
      "kilas",
      "konter",
      "otomojok",
      "maljum",
      "terminal",
    ];
    if (!mojokSection.includes(jenis_halam)) {
        console.log("Jenis halaman tidak ada pada laman Mojok.Co");
        console.log("Halaman yang dapat dipilih adalah: ", mojokSection.join(", "));
      return;
    }
    const allNews = [];
    for (let x = 1; x <= jml_hal; x++) {
      const response = await axios.get(
        `https://mojok.co/${jenis_halam}/page/${x}`
      );
      const $ = cheerio.load(response.data);
      const posts = $(".jeg_postblock").find(".jeg_post");
      posts.each((index, element) => {
        const uhuys = $(element).find(".jeg_post_title");
        const author = $(element).find(".jeg_meta_author");
        allNews.push({
          Judul: uhuys.find("a").text(),
          Link: uhuys.find("a").attr("href"),
          Author: author.find("a").text(),
        });
      });
    }
    return allNews;
  }
}
