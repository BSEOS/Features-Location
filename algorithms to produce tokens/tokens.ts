class Tokens{
    constructor(){
    }

    concatLisStrings(listStrings : String[]) : String {
        let finalString : String = "";
        for (let s of listStrings) {
            finalString = finalString.concat(s.toString());
        }
        return finalString;
    }

    removeSpecialChars(documents : String[]) : String[] {
        for (var i = 0; i < documents.length; i++){
            documents[i] = documents[i].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,' ');
        }
        return documents;
    }

    removeStopWords(documents : String[][], stopwords : String[]) : String[][] {
        let tmp : String;
        for (var i = 0; i < documents.length; i++){
           for (var j = 0; j < stopwords.length; j++) {
              for (var k = 0; k < documents[i].length; k++){
                    if (documents[i][k] == stopwords[j]){
                        tmp = documents[i][documents[i].length-1];
                        documents[i][k] = tmp;
                        documents[i].pop();
                    }
              }
            }
        }
        return documents;
    }

    listStringsupperCase(listStrings : String[]) : String[]{
        for (var i = 0; i < listStrings.length; i++) {
            listStrings[i] = listStrings[i].toUpperCase();
        }
        return listStrings;
    }

    tokensGenerator(documents : String[]) : String[][]{
        let documentsTokens : String[][] = [];
        for (var i = 0; i < documents.length; i++) {
            documentsTokens.push(documents[i].split(" "));
        }
        return documentsTokens;
    }
}

let documents : String[] = [ 
    "The Neatest Little Guide to Stock Market Investing", 
    "Investing For Dummies, 4th Edition", 
    "The Little Book of Common Sense Investing: The Only Way to Guarantee Your Fair Share of Stock Market Returns",
    "The Little Book of Value Investing", "Value Investing: From Graham to Buffett and Beyond", 
    "Rich Dad's Guide to Investing: What the Rich Invest in, That the Poor and the Middle Class Do Not!", 
    "Investing in Real Estate, 5th Edition", 
    "Stock Investing For Dummies", 
    "Rich Dad's Advisors: The ABC's of Real Estate Investing: The Secrets of Finding Hidden Profits Most Investors Miss" 
];

let stopwords : String[] = ["and","edition","for","in","little","of","the","to"];
let documentsTokens : String[][];

let docs = new Tokens();
docs.removeSpecialChars(documents);
documents = docs.listStringsupperCase(documents);
stopwords = docs.listStringsupperCase(stopwords);
documentsTokens = docs.tokensGenerator(documents)
documentsTokens = docs.removeStopWords(documentsTokens, stopwords);
console.log(documentsTokens);