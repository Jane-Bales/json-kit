/*
	The Cedric's Swiss Knife (CSK) - CSK object tree toolbox test suite

	Copyright (c) 2014, 2015 Cédric Ronvel 
	
	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

/* jshint unused:false */
/* global describe, it, before, after */

"use strict" ;



var fs = require( 'fs' ) ;
var json = require( '../lib/json.js' ) ;
var expect = require( 'expect.js' ) ;





			/* Helpers */



function testStringifyEq( v )
{
	expect( json.stringify( v ) )
		.to.be( JSON.stringify( v ) ) ;
}

function testParseEq( s )
{
	expect( JSON.stringify(
			json.parse( s )
		) )
		.to.be( JSON.stringify(
			JSON.parse( s )
		) ) ;
}




			/* Tests */



describe( "JSON stringify" , function() {
	
	it( "basic test" , function() {
		
		testStringifyEq( undefined ) ;
		testStringifyEq( null ) ;
		testStringifyEq( true ) ;
		testStringifyEq( false ) ;
		
		testStringifyEq( 0 ) ;
		testStringifyEq( 0.0000000123 ) ;
		testStringifyEq( -0.0000000123 ) ;
		testStringifyEq( 1234 ) ;
		testStringifyEq( -1234 ) ;
		testStringifyEq( NaN ) ;
		testStringifyEq( Infinity ) ;
		testStringifyEq( - Infinity ) ;
		
		testStringifyEq( '' ) ;
		testStringifyEq( '0' ) ;
		testStringifyEq( '1' ) ;
		testStringifyEq( '123' ) ;
		testStringifyEq( 'A' ) ;
		testStringifyEq( 'ABC' ) ;
		testStringifyEq( '\ta"b"c\n\rAB\tC\né~\'#&|_\\-ł"»¢/æ//nĸ^' ) ;
		testStringifyEq( '\t\v\x00\x01\x7f\x1fa\x7fa' ) ;
		
		testStringifyEq( {} ) ;
		testStringifyEq( {a:1,b:'2'} ) ;
		testStringifyEq( {a:1,b:'2',c:true,d:null,e:undefined} ) ;
		//console.log( json.stringify( {a:1,b:'2',c:true,d:null,e:undefined} ) ) ;
		testStringifyEq( {a:1,b:'2',sub:{c:true,d:null,e:undefined,sub:{f:''}}} ) ;
		
		testStringifyEq( [] ) ;
		testStringifyEq( [1,'2'] ) ;
		testStringifyEq( [1,'2',[null,undefined,true]] ) ;
		
		testStringifyEq( require( '../sample/sample1.json' ) ) ;
		testStringifyEq( require( '../sample/stringFlatObject.js' ) ) ;
		
		// Investigate why it does not work
		//testStringifyEq( require( '../sample/garbageStringObject.js' ) ) ;
	} ) ;
	
	it( "depth limit" , function() {
		
		var o = {
			a: 1,
			b: 2,
			c: {
				d: 4,
				e: 5
			}
		} ;
		
		expect( json.stringify( o ) ).to.be( '{"a":1,"b":2,"c":{"d":4,"e":5}}' ) ;
		expect( json.stringify( o , { depth: 0 } ) ).to.be( 'null' ) ;
		expect( json.stringify( o , { depth: 1 } ) ).to.be( '{"a":1,"b":2,"c":null}' ) ;
		expect( json.stringify( o , { depth: 2 } ) ).to.be( '{"a":1,"b":2,"c":{"d":4,"e":5}}' ) ;
		
		var a = {
			k1: 1,
			k2: 2
		} ;
		
		var b = {
			k4: 1,
			k5: 2
		} ;
		
		a.k3 = b ;
		b.k6 = a ;
		
		o = {
			a: a,
			b: b
		} ;
		
		expect( json.stringify( a , { depth: 2 } ) ).to.be( '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":null}}' ) ;
		expect( json.stringify( a , { depth: 3 } ) ).to.be( '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":null}}}' ) ;
		expect( json.stringify( a , { depth: 4 } ) ).to.be( '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":null}}}}' ) ;
		
		expect( json.stringify( o , { depth: 2 } ) ).to.be( '{"a":{"k1":1,"k2":2,"k3":null},"b":{"k4":1,"k5":2,"k6":null}}' ) ;
		expect( json.stringify( o , { depth: 3 } ) ).to.be( '{"a":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":null}},"b":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":null}}}' ) ;
		expect( json.stringify( o , { depth: 4 } ) ).to.be( '{"a":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":null}}},"b":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":null}}}}' ) ;
	} ) ;
	
	it( "circular ref notation" , function() {
		
		var a = {
			k1: 1,
			k2: 2
		} ;
		
		var b = {
			k4: 1,
			k5: 2
		} ;
		
		a.k3 = b ;
		b.k6 = a ;
		
		var o = {
			a: a,
			b: b
		} ;
		
		expect( json.stringify( a , { mode: "circularRefNotation" } ) ).to.be( '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"@@ref@@":-2}}}' ) ;
		expect( json.stringify( o , { mode: "circularRefNotation" } ) ).to.be( '{"a":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"@@ref@@":-2}}},"b":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":{"@@ref@@":-2}}}}' ) ;
	} ) ;
	
	it( "unique ref notation" , function() {
		
		var a = {
			k1: 1,
			k2: 2
		} ;
		
		var b = {
			k4: 1,
			k5: 2
		} ;
		
		a.k3 = b ;
		b.k6 = a ;
		
		var o = {
			a: a,
			b: b
		} ;
		
		expect( json.stringify( a , { mode: "uniqueRefNotation" } ) ).to.be( '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"@@ref@@":[]}}}' ) ;
		//expect( json.stringify( o , { mode: "uniqueRefNotation" } ) ).to.be( '{"a":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"@@ref@@":["a"]}}},"b":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":{"@@ref@@":-2}}}}' ) ;
	} ) ;
} ) ;


	
describe( "JSON parse" , function() {
	
	it( "basic test" , function() {
		
		testParseEq( 'null' ) ;
		testParseEq( 'true' ) ;
		testParseEq( 'false' ) ;
		
		testParseEq( '0' ) ;
		testParseEq( '1' ) ;
		testParseEq( '123' ) ;
		testParseEq( '-123' ) ;
		testParseEq( '123.456' ) ;
		testParseEq( '-123.456' ) ;
		testParseEq( '0.123' ) ;
		testParseEq( '-0.123' ) ;
		testParseEq( '0.00123' ) ;
		testParseEq( '-0.00123' ) ;
		
		testParseEq( '""' ) ;
		testParseEq( '"abc"' ) ;
		testParseEq( '"abc\\"def"' ) ;
		testParseEq( '"abc\\ndef\\tghi\\rjkl"' ) ;
		testParseEq( '"abc\\u0000\\u007f\\u0061def\\"\\"jj"' ) ;
		
		testParseEq( '{}' ) ;
		testParseEq( '{"a":1}' ) ;
		testParseEq( '{"a":1,"b":"string","c":"","d":null,"e":true,"f":false}' ) ;
		testParseEq( '{"a":1,"b":"string","c":"","d":null,"e":true,"f":false,"sub":{"g":123,"h":{},"i":{"j":"J!"}}}' ) ;
		
		testParseEq( '[]' ) ;
		testParseEq( '[1,2,3]' ) ;
		testParseEq( '[-12,1.5,"toto",true,false,null,0.3]' ) ;
		testParseEq( '[-12,1.5,"toto",true,false,null,0.3,[1,2,3],[4,5,6]]' ) ;
		
		testParseEq( '{"a":1,"b":"string","c":"","d":null,"e":true,"f":false,"sub":{"g":123,"h":[1,2,3],"i":["j","J!"]}}' ) ;
		testParseEq( '[-12,1.5,"toto",{"g":123,"h":[1,2,3],"i":["j","J!"]},true,false,null,0.3,[1,2,3],[4,5,6]]' ) ;
		
		testParseEq( ' { "a" :   1 , "b":  \n"string",\n  "c":"" \t,\n\t"d" :   null,"e":true,   "f"   :   false  , "sub":{"g":123,"h":[1,2,3],"i":["j","J!"]}}' ) ;
		
		testParseEq( fs.readFileSync( __dirname + '/../sample/sample1.json' ).toString() ) ;
	} ) ;
	
	it( "circular ref notation" , function() {
		
		var aJson = '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"@@ref@@":-2}}}' ;
		var oJson = '{"a":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"@@ref@@":-2}}},"b":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":{"@@ref@@":-2}}}}' ;
		
		var a = {
			k1: 1,
			k2: 2
		} ;
		
		var b = {
			k4: 1,
			k5: 2
		} ;
		
		a.k3 = b ;
		b.k6 = a ;
		
		var o = {
			a: a,
			b: b
		} ;
		
		var aParsed = json.parse( aJson , { mode: "circularRefNotation" } ) ;
		expect( aParsed.k1 ).to.be( 1 ) ;
		expect( aParsed.k2 ).to.be( 2 ) ;
		expect( aParsed.k3.k4 ).to.be( 1 ) ;
		expect( aParsed.k3.k5 ).to.be( 2 ) ;
		expect( aParsed.k3.k6 ).to.be( aParsed ) ;
		
		var oParsed = json.parse( oJson , { mode: "circularRefNotation" } ) ;
		expect( oParsed.a.k1 ).to.be( 1 ) ;
		expect( oParsed.a.k2 ).to.be( 2 ) ;
		expect( oParsed.b.k4 ).to.be( 1 ) ;
		expect( oParsed.b.k5 ).to.be( 2 ) ;
		expect( oParsed.a.k3.k6 ).to.be( oParsed.a ) ;
		expect( oParsed.b.k6.k3 ).to.be( oParsed.b ) ;
		
		//expect( oParsed.a.k3 ).to.be( oParsed.b ) ;	// not true in this mode
		//expect( oParsed.b.k6 ).to.be( oParsed.a ) ;	// not true in this mode
	} ) ;
	
	it( "depth limit" , function() {
		
		var oJson ;
		
		oJson = '{"a":1,"b":2,"c":{"d":4,"e":5},"f":6}' ;
		expect( json.parse( oJson , { depth: 0 } ) ).to.be( undefined ) ;
		expect( json.parse( oJson , { depth: 1 } ) ).to.eql( {a:1,b:2,c:undefined,f:6} ) ;
		expect( json.parse( oJson , { depth: 2 } ) ).to.eql( {a:1,b:2,c:{d:4,e:5},f:6} ) ;
		
		oJson = '{"a":1,"b":2,"c":{"nasty\\n\\"key}}]][{":"nasty[value{}}}]]"},"f":6}' ;
		expect( json.parse( oJson , { depth: 1 } ) ).to.eql( {a:1,b:2,c:undefined,f:6} ) ;
	} ) ;
} ) ;



describe( "stringifyStream()" , function() {
	
	it( "empty input stream should output a stream of an empty array" , function( done ) {
		var stream = json.stringifyStream() ;
		var str = '' ;
		
		stream.on( 'data' , function( data ) {
			str += data.toString() ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( str ).to.be( '[]' ) ;
			done() ;
		} ) ;
		
		stream.end() ;
	} ) ;
	
	it( "when the input stream push some object, the output stream should push an array of object" , function( done ) {
		var stream = json.stringifyStream() ;
		var str = '' ;
		
		stream.on( 'data' , function( data ) {
			str += data.toString() ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( str ).to.be( '[{"a":1,"b":2,"c":"C"},{"toto":"titi"}]' ) ;
			done() ;
		} ) ;
		
		stream.write( { a: 1 , b: 2 , c: 'C' } ) ;
		stream.write( { toto: "titi" } ) ;
		stream.end() ;
	} ) ;
} ) ;



describe( "parseStream()" , function() {
	
	it( 'empty stream (i.e.: "[]")' , function( done ) {
		var stream = json.parseStream() ;
		var array = [] ;
		
		stream.on( 'data' , function( data ) {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( array ).to.eql( [] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;
		
		stream.write( '[]' ) ;
		stream.end() ;
	} ) ;
	
	it( "single object in one write" , function( done ) {
		var stream = json.parseStream() ;
		var array = [] ;
		
		stream.on( 'data' , function( data ) {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( array ).to.eql( [
				{ a: 1, b: 2, c: 'C' }
			] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;
		
		stream.write( '[ { "a": 1 , "b": 2 , "c": "C" } ]' ) ;
		stream.end() ;
	} ) ;
	
	it( "single string in one write" , function( done ) {
		var stream = json.parseStream() ;
		var array = [] ;
		
		stream.on( 'data' , function( data ) {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( array ).to.eql( [ "nasty string, with comma, inside" ] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;
		
		stream.write( '[ "nasty string, with comma, inside" ]' ) ;
		stream.end() ;
	} ) ;
	
	it( "single object in two write" , function( done ) {
		var stream = json.parseStream() ;
		var array = [] ;
		
		stream.on( 'data' , function( data ) {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( array ).to.eql( [
				{ a: 1, b: 2, c: 'C' }
			] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;
		
		stream.write( '[ { "a": 1 , "b' ) ;
		stream.write( '": 2 , "c": "C" } ]' ) ;
		stream.end() ;
	} ) ;
	
	it( "single object in multiple write" , function( done ) {
		var stream = json.parseStream() ;
		var array = [] ;
		
		stream.on( 'data' , function( data ) {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( array ).to.eql( [
				{ a: 1, b: 2, c: 'C' }
			] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;
		
		stream.write( '   ' ) ;
		stream.write( '  \n ' ) ;
		stream.write( '  \n [ ' ) ;
		stream.write( '{ "a": ' ) ;
		stream.write( ' 1 , "b' ) ;
		stream.write( '": 2 , "' ) ;
		stream.write( 'c": "C" }' ) ;
		stream.write( '  ] ' ) ;
		stream.write( '  ' ) ;
		stream.end() ;
	} ) ;
	
	it( "multiple objects in one write" , function( done ) {
		var stream = json.parseStream() ;
		var array = [] ;
		
		stream.on( 'data' , function( data ) {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( array ).to.eql( [
				{ a: 1, b: 2, c: 'C' } ,
				{ one: 1 } ,
				[ "two" , "three" ] ,
				true ,
				false ,
				undefined
			] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;
		
		stream.write( '[{"a":1,"b":2,"c":"C"},{"one":1},[ "two" , "three" ] , true , false , null ]' ) ;
		stream.end() ;
	} ) ;
	
	it( "multiple objects in many write" , function( done ) {
		var stream = json.parseStream() ;
		var array = [] ;
		
		stream.on( 'data' , function( data ) {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( array ).to.eql( [
				{ a: 1, b: 2, c: 'C' } ,
				{ one: 1 } ,
				[ "two" , "three" ] ,
				true ,
				false ,
				undefined
			] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;
		
		stream.write( '   ' ) ;
		stream.write( '  \n ' ) ;
		stream.write( '  \n [{ ' ) ;
		stream.write( '"a":1' ) ;
		stream.write( ',"b":2,' ) ;
		stream.write( '"c":"C"}' ) ;
		stream.write( ',' ) ;
		stream.write( '{"one":1},[ "tw' ) ;
		stream.write( 'o" , "thr' ) ;
		stream.write( 'ee" ] , tr' ) ;
		stream.write( 'ue , false , ' ) ;
		stream.write( 'n' ) ;
		stream.write( 'u' ) ;
		stream.write( 'll ]' ) ;
		stream.write( ' \n ' ) ;
		stream.end() ;
	} ) ;
	
	it( "multiple objects in many write with nasty strings" , function( done ) {
		var stream = json.parseStream() ;
		var array = [] ;
		
		stream.on( 'data' , function( data ) {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( array ).to.eql( [
				{ a: '  "  }  ', b: 2, c: '  C{[' } ,
				{ one: 1 } ,
				[ '  tw"}"}o' , '\\"thr\\ee\n' ] ,
				true ,
				false ,
				undefined
			] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;
		
		stream.write( '   ' ) ;
		stream.write( '  \n ' ) ;
		stream.write( '  \n [{ ' ) ;
		stream.write( '"a":"  \\"  }  "' ) ;
		stream.write( ',"b":2,' ) ;
		stream.write( '"c":"  C{["}' ) ;
		stream.write( ',' ) ;
		stream.write( '{"one":1},[ "  tw\\"}' ) ;
		stream.write( '\\"}o" , "\\\\\\"thr\\\\' ) ;
		stream.write( 'ee\\n" ] , tr' ) ;
		stream.write( 'ue , false , ' ) ;
		stream.write( 'n' ) ;
		stream.write( 'u' ) ;
		stream.write( 'll ]' ) ;
		stream.write( ' \n ' ) ;
		stream.end() ;
	} ) ;
} ) ;


