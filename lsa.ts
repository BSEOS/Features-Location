// https://technowiki.wordpress.com/2011/08/27/latent-semantic-analysis-lsa-tutorial/

import { normalizeForSearch } from "normalize-for-search";


let titles = [
    "The Neatest Little Guide to Stock Market Investing",
    "Investing For Dummies, 4th Edition",
    "The Little Book of Common Sense Investing: The Only Way to Guarantee Your Fair Share of Stock Market Returns",
    "The Little Book of Value Investing",
    "Value Investing: From Graham to Buffett and Beyond",
    "Rich Dad's Guide to Investing: What the Rich Invest in , That the Poor and the Middle Class Do Not!",
    "Investing in Real Estate, 5th Edition",
    "Stock Investing For Dummies",
    "Rich Dad's Advisors: The ABC's of Real Estate Investing: The Secrets of Finding Hidden Profits Most Investors Miss"
]

let stopwords = ['and', 'edition', 'for', 'in', 'little', 'of', 'the', 'to']
let ignorechars = ["/", ",", ":", "!", "", "\\"]


class LSA {

    stopWords: string[]
    ignoreChars: string[]
    wDict: {}
    documentCount: number
    docs: string[]

    constructor(stopwords, ignorechars) {
        this.stopWords = stopwords
        this.ignoreChars = ignorechars
    }

    removeStops(text: string) {
        for (let x of this.stopWords) {
            text = text.replace(" " + x + " ", "#")
        }
        return text
    }


    normalize(s) {
        // console.log('normalize', s)


        s = normalizeForSearch(s);

        s = s.stripPunctuation().s;

        return s.split(' ');

    }

    parseDocument(doc) {
        const words = this.normalize(doc);
        words.map(word => {

            if (this.stopWords.filter(stopWord => word === stopWord) !== []) {
            } else if (this.wDict[word] !== undefined) {
                this.wDict[word].push(this.documentCount)
            } else {
                this.wDict[word] = [this.documentCount];
            }
        })
        this.documentCount++
        this.docs.push(doc)
    }

    getDocs(){
        return this.docs;
    }
}



let l = new LSA(stopwords, ignorechars);
l.parseDocument(titles)
let docs = l.getDocs;
console.log(docs);

