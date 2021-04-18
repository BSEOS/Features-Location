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

    removeWordsExpectIndexs(dictionary : Map<String, number[]>) : Map<String, number[]> {
        for (let key of dictionary.keys()) {
            if ((dictionary.get(key)!).length < 2){
                dictionary.delete(key);
            }
        }
        return dictionary;   
    }

    dictionarygenerator(documents : String[], stopwords : String[]) : Map<String, number[]>{
        let dictionary = new Map<String, number[]>();
        documents = this.removeSpecialChars(documents);
        documents = this.listStringsupperCase(documents);
        stopwords = this.listStringsupperCase(stopwords);
        let documentsTokens : String[][];
        documentsTokens = this.tokensGenerator(documents);
        documentsTokens = this.removeStopWords(documentsTokens, stopwords);
        for (var i = 0; i < documentsTokens.length; i++){
            for (var j = 0; j < documentsTokens[i].length; j++){
                if (dictionary.has(documentsTokens[i][j])){
                   let list : number[] = [];
                   list = dictionary.get(documentsTokens[i][j])!;
                   list.push(i+1);
                   dictionary.set(documentsTokens[i][j], list);
                } else {
                   dictionary.set(documentsTokens[i][j], [i+1]);
                }
            }
        }
        return new Map([...dictionary].sort());
    }

    matrixGenerator(dictionaty : Map<String, number[]>, document : String[]) : Map<String, [number, number][]> {
        let matrix = new Map<String, [number, number][]>();
        for (let key of dictionary.keys()) {
            let list : number[] = [];
            list = dictionary.get(key)!;
            for (var i = 0; i < list.length; i++){
                let indexDocument = list[i]-1;
                if (matrix.has(key)){
                    let l : [number, number][];
                    l = (matrix.get(key)!);
                    let find : boolean = false;
                    for (var j = 0; j < l.length; j++){
                        let doc = l[j][0];
                        let cpt = l[j][1];
                        if (doc == indexDocument+1) {
                            l[j] = [indexDocument+1, 1+cpt];
                            matrix.set(key,l);
                            find = true;
                        }
                        if(find == true) break;
                    }
                    if (find == false){
                        l.push([indexDocument+1, 1]);
                        matrix.set(key,l);
                    }
                } else {
                    matrix.set(key,[[indexDocument+1, 1]]);
                }
            }
        }
        return matrix;
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

let stopwords : String[] = ["and","edition","for","in","little","of","the","to", "", ''];
let documentsTokens : String[][];

let docs = new Tokens();
let dictionary = new Map<String, number[]>();

dictionary = docs.dictionarygenerator(documents, stopwords);
dictionary = docs.removeWordsExpectIndexs(dictionary);

let matrix = new Map<String, [number, number][]>();
matrix = docs.matrixGenerator(dictionary, documents);
console.log(matrix);






