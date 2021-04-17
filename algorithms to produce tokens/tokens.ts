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
            documents[i] = documents[i].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,'');
        }
        return documents;
    }

    removeStopWords(documents : String[], stopwords : String[]) : String[] {
        for (var i = 0; i < documents.length; i++){
           for (var j = 0; j < stopwords.length; j++) {
               documents[0] = documents[0].replace(stopwords[j].toString(),'');
            }
        }
        return documents;
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

let stopwords : String[] = [" and"," edition"," for"," in"," little"," of"," the",' to'];

let docs = new Tokens();
docs.removeSpecialChars(documents);
documents = docs.removeStopWords(documents, stopwords);
console.log(documents);