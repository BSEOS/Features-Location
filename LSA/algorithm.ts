// @ts-ignore
import { SVD } from 'svd-js'

class Lsa{

  documents : String[] = [];
  stopwords : String[] = [];
  dictionary = new Map<String, number[]>();

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

  matrix(dictionary : Map<String, number[]>, document : String[]) : number[][] {
      let matrix : number[][] = [];
      // init matrix
      for (let key of dictionary.keys()) {
          let ligne : number[] = [];
          for (var i = 0; i < document.length; i++){
              ligne.push(0);
          }
          matrix.push(ligne);
      }
      // editing cpts
      let j = 0;
      for (let key of dictionary.keys()) {
          let list : number[] = [];
          list = dictionary.get(key)!; 
          for (var i = 0; i < list.length; i++){
              matrix[j][list[i]-1]++;
          }
          j++;
      }
      return matrix;
  }

  matrixGenerator(dictionary : Map<String, number[]>, document : String[]) : Map<String, [number, number][]> {
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

  numberWordsInDocument(matrix : Map<String, [number, number][]>, index : number) : number{
      let cpt = 0;
      for (let key of this.dictionary.keys()){
          let list : [number, number][];
          list = (matrix.get(key)!);
          for (var i = 0; i < list.length; i++){
              if (list[i][0] == index) cpt++
           }         
      }
      return cpt;
  }

  TFIDF( matrix : Map<String, [number, number][]>) : Map<String, [number, number][]>{
      for (let key of this.dictionary.keys()){
          let list : [number, number][];
          list = (matrix.get(key)!);
         for (var i = 0; i < list.length; i++){
            let Nij : number = list[i][1];
            let Nj : number = this.numberWordsInDocument(matrix, list[i][0]);
            let D : number = this.documents.length;
            let Di : number = (matrix.get(key)!).length;
            let calclog : number = (Math.log(D/Di));
            let calcN : number = Nij/Nj;
            list[i][1] = parseFloat((calcN*calclog).toPrecision(2));
            matrix.set(key,list);
         } 
      }
      return matrix;
  }

  printMatrix(matrix : number[][]) {
      let ligne : String= "";
      for (var i = 0; i < matrix.length; i++){
          for (var j = 0; j < matrix[i].length; j++){
              ligne = ligne.concat(matrix[i][j].toString());
          }
          console.log(ligne);
          ligne = "";
      }
  }

  sliceMatrixCarree(matrix : number[][], from : number, end : number) : number[][]{
    matrix = matrix.slice(from, end);
    for (var i = 0; i < end; i++){
        matrix[i] = matrix[i].slice(from,end);
    }
    return matrix;
  }

  sliceMatrixRect(matrix : number[][], numberLines : number) : number[][]{
    return matrix.slice(0, numberLines);
  }

  vectorToOrthMatrix(vector : number[]) : number[][]{
    let matrix : number[][] = [];
    for (var i = 0; i < vector.length; i++){
        let ligne : number[] = [];
        for (var j = 0; j < vector.length; j++){
            if (i == j ){
                ligne.push(parseFloat(vector[i].toPrecision(2)));
            } else {
                ligne.push(0);
            };
        }
        matrix.push(ligne)
    }
    return matrix;
  }

  transposeMatrix(matrix : number[][]) : number[][] {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  }

    multiplyMatrixs(matrix1 : number[][], matrix2 : number[][]) : number[][]{
        let numberRows1 = matrix1.length,
            numberCols1 = matrix1[0].length,
            numberRows2 = matrix2.length,
            numberCols2 = matrix2[0].length,
            matrix = new Array(numberRows1);

        for (var r = 0; r < numberRows1; ++r) {
         matrix[r] = new Array(numberCols2); // initialize the current row
            for (var c = 0; c < numberCols2; ++c) {
                matrix[r][c] = 0;             // initialize the current cell
                for (var i = 0; i < numberCols1; ++i) {
                    matrix[r][c] += matrix1[r][i] * matrix2[i][c];
                 }
             }
         }
    return matrix;
    }

    index_of_key_in_map(mot_cle : String) : number {
        let indice : number = 0;
        for (let key of this.dictionary.keys()){
            if (mot_cle.toLocaleUpperCase() == key) {
                return indice;
            }
            indice++;
        }
    return -1;
    }

    contient(list : String[], chaine : String) : boolean{
        for(let element of list){
            if (element.toLocaleUpperCase() == chaine)
             return true;
        }
    return false;
    }

    generator_query_vector(mot_cles : String) : number[] {
        let tokens_mots_cle : String[];
        tokens_mots_cle = mot_cles.split(" ");
        let query : number[] = [];
        for (let key of this.dictionary.keys()){
            if (this.contient(tokens_mots_cle, key)) {
                query.push(1);
            } else {
                query.push(0);
            }
        }
        return query;
    }

    lsa(){
        let matrixFinal : number[][] = [];
        this.dictionary = this.dictionarygenerator(this.documents, this.stopwords);
        this.dictionary = this.removeWordsExpectIndexs(this.dictionary);
        //console.log(this.index_of_key_in_map("RICH"));
        console.log(this.dictionary);
        console.log(this.generator_query_vector("RICH ESTATE"));
        let matrix : number[][] = [
            [1,1,0,0,1,0,0,1], [1,0,0,0,1,1,0,1], [1,0,1,0,1,0,1,0], [0,1,0,0,0,1,0,0],
            [0,1,0,0,1,1,0,0], [0,1,1,0,1,1,0,0], [0,0,0,0,1,1,0,0], [0,0,0,0,1,0,1,0],
            [0,0,0,0,1,0,1,1]
        ];

        
        //matrix = this.matrix(this.dictionary, this.documents);
       //console.log(matrix);
        console.log("#########");
        const { u, v, q } = SVD(matrix);
        let matrixQ = this.vectorToOrthMatrix(q);
        matrixQ = this.sliceMatrixCarree(matrixQ, 0, 3);
        let matrixV = v;
        //console.log(u);
       // console.log("#########");
       // console.log(matrixQ);
       // console.log("#########");
       // console.log(matrixV);
        matrixV = this.transposeMatrix(matrixV);
        matrixV = this.sliceMatrixRect(matrixV, 3);
        matrixFinal = this.multiplyMatrixs(matrixQ, matrixV);
        return matrixFinal
    }

    readDocument(fileName : String){
        let document : String = fs.readFileSync(fileName, 'utf8');
        this.documents.push(document);
    }

    readJson(fileName : String){
        this.stopwords = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    }
    
}

var fs = require("fs");

let docs = new Lsa();

docs.readDocument('./Samples/document1.txt');
docs.readDocument('./Samples/document2.txt');
docs.readDocument('./Samples/document3.txt');
docs.readDocument('./Samples/document4.txt');
docs.readDocument('./Samples/document5.txt');
docs.readDocument('./Samples/document6.txt');
docs.readDocument('./Samples/document7.txt');
docs.readDocument('./Samples/document8.txt');
docs.readDocument('./Samples/document9.txt');

docs.readJson('./Samples/stopwords.txt');

let matrixResult = docs.lsa();

//console.log(matrixResult);