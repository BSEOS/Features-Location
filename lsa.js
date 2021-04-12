"use strict";
// https://technowiki.wordpress.com/2011/08/27/latent-semantic-analysis-lsa-tutorial/
exports.__esModule = true;
var normalize_for_search_1 = require("normalize-for-search");
var titles = [
    "The Neatest Little Guide to Stock Market Investing",
    "Investing For Dummies, 4th Edition",
    "The Little Book of Common Sense Investing: The Only Way to Guarantee Your Fair Share of Stock Market Returns",
    "The Little Book of Value Investing",
    "Value Investing: From Graham to Buffett and Beyond",
    "Rich Dad's Guide to Investing: What the Rich Invest in , That the Poor and the Middle Class Do Not!",
    "Investing in Real Estate, 5th Edition",
    "Stock Investing For Dummies",
    "Rich Dad's Advisors: The ABC's of Real Estate Investing: The Secrets of Finding Hidden Profits Most Investors Miss"
];
var stopwords = ['and', 'edition', 'for', 'in', 'little', 'of', 'the', 'to'];
var ignorechars = ["/", ",", ":", "!", "", "\\"];
var LSA = /** @class */ (function () {
    function LSA(stopwords, ignorechars) {
        this.stopWords = stopwords;
        this.ignoreChars = ignorechars;
    }
    LSA.prototype.removeStops = function (text) {
        for (var _i = 0, _a = this.stopWords; _i < _a.length; _i++) {
            var x = _a[_i];
            text = text.replace(" " + x + " ", "#");
        }
        return text;
    };
    LSA.prototype.normalize = function (s) {
        // console.log('normalize', s)
        s = normalize_for_search_1.normalizeForSearch(s);
        s = s.stripPunctuation().s;
        return s.split(' ');
    };
    LSA.prototype.parseDocument = function (doc) {
        var _this = this;
        var words = this.normalize(doc);
        words.map(function (word) {
            if (_this.stopWords.filter(function (stopWord) { return word === stopWord; }) !== []) {
            }
            else if (_this.wDict[word] !== undefined) {
                _this.wDict[word].push(_this.documentCount);
            }
            else {
                _this.wDict[word] = [_this.documentCount];
            }
        });
        this.documentCount++;
        this.docs.push(doc);
    };
    LSA.prototype.getDocs = function () {
        return this.docs;
    };
    return LSA;
}());
var l = new LSA(stopwords, ignorechars);
l.parseDocument(titles);
var docs = l.getDocs;
console.log(docs);
