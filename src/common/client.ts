import { Axios } from "axios";

let axiosClient = new Axios({
    headers: {
        // "Host": "https://indeks.kompas.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.71 Safari/537.36"
    },
});



export default axiosClient;