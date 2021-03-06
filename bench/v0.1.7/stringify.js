/*
	The Cedric's Swiss Knife (CSK) - CSK JSON

	Copyright (c) 2016 Cédric Ronvel 
	
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

"use strict" ;



function stringifyAnyType( v , runtime )
{
	if ( v === undefined || v === null )
	{
		runtime.str += "null" ;
		return ;
	}
	
	switch ( typeof v )
	{
		case 'boolean' :
			return stringifyBoolean( v , runtime ) ;
		case 'number' :
			return stringifyNumber( v , runtime ) ;
		case 'string' :
			return stringifyString( v , runtime ) ;
		case 'object' :
			return stringifyAnyObject( v , runtime ) ;
	}
}



function stringifyBoolean( v , runtime )
{
	runtime.str += ( v ? "true" : "false" ) ;
}



function stringifyNumber( v , runtime )
{
	if ( Number.isNaN( v ) || v === Infinity || v === -Infinity ) { runtime.str += "null" ; }
	else { runtime.str += v ; }
}



function stringifyString( v , runtime )
{
	var i = 0 , l = v.length , c ;
	
	// Faster on big string than stringifyStringLookup(), also big string are more likely to have at least one bad char
	if ( l >= 200 ) { return stringifyStringRegex( v , runtime ) ; }
	
	// Most string are left untouched, so it's worth checking first if something must be changed.
	// Gain 33% of perf on the whole stringify().
	//*
	for ( ; i < l ; i ++ )
	{
		c = v.charCodeAt( i ) ;
		
		if (
			c <= 0x1f ||	// control chars
			c === 0x5c ||	// backslash
			c === 0x22		// double quote
		)
		{
			if ( l > 100 )
			{
				stringifyStringLookup( v , runtime ) ;
			}
			else
			{
				stringifyStringRegex( v , runtime ) ;
			}
			
			return ;
		}
	}
	//*/
	
	runtime.str += '"' + v + '"' ;
}



var stringifyStringLookup_ = 
( function createStringifyStringLookup()
{
	var c = 0 , lookup = [] ;
	
	for ( ; c < 0x80 ; c ++ )
	{
		if ( c === 0x09 )	// tab
		{
			lookup[ c ] = '\\t' ;
		}
		else if ( c === 0x0a )	// new line
		{
			lookup[ c ] = '\\n' ;
		}
		else if ( c === 0x0c )	// form feed
		{
			lookup[ c ] = '\\f' ;
		}
		else if ( c === 0x0d )	// carriage return
		{
			lookup[ c ] = '\\r' ;
		}
		else if ( c <= 0x0f )	// control chars
		{
			lookup[ c ] = '\\u000' + c.toString( 16 ) ;
		}
		else if ( c <= 0x1f )	// control chars
		{
			lookup[ c ] = '\\u00' + c.toString( 16 ) ;
		}
		else if ( c === 0x5c )	// backslash
		{
			lookup[ c ] = '\\\\' ;
		}
		else if ( c === 0x22 )	// double-quote
		{
			lookup[ c ] = '\\"' ;
		}
		else
		{
			lookup[ c ] = String.fromCharCode( c ) ;
		}
	}
	
	return lookup ;
} )() ;



function stringifyStringLookup( v , runtime )
//function stringifyString( v , runtime )
{
	var i = 0 , iMax = v.length , c ;
	
	runtime.str += '"' ;
	
	for ( ; i < iMax ; i ++ )
	{
		c = v.charCodeAt( i ) ;
		
		if ( c < 0x80 )
		{
			runtime.str += stringifyStringLookup_[ c ] ;
		}
		else
		{
			runtime.str += v[ i ] ;
		}
	}
	
	runtime.str += '"' ;
}



var stringifyStringRegex_ = /[\x00-\x1f"\\]/g ;

function stringifyStringRegex( v , runtime )
//function stringifyString( v , runtime )
{
	runtime.str += '"' + v.replace( stringifyStringRegex_ , stringifyStringRegexCallback ) + '"' ;
}

function stringifyStringRegexCallback( match )
{
	return stringifyStringLookup_[ match.charCodeAt( 0 ) ] ;
}



function stringifyAnyObject( v , runtime )
{
	if ( typeof v.toJSON === 'function' )
	{
		runtime.str += v.toJSON() ;
	}
	else if ( Array.isArray( v ) )
	{
		stringifyArray( v , runtime ) ;
	}
	else
	{
		stringifyStrictObject( v , runtime ) ;
	}
}



function stringifyArray( v , runtime )
{
	var i = 0 , iMax = v.length ;
	
	runtime.str += '[' ;
	
	for ( ; i < iMax ; i ++ )
	{
		//runtime.str += ( i ? ',' : '' ) ;
		if ( i ) { runtime.str += ',' ; }
		stringifyAnyType( v[ i ] , runtime ) ;
	}
	
	runtime.str += ']' ;
}



// Faster than stringifyStrictObjectMemory(), but cost a bit more memory
function stringifyStrictObject( v , runtime )
{
	var i , iMax , keys ;
	
	runtime.str += '{' ;
	
	keys = Object.keys( v ) ;
	
	for ( i = 0 , iMax = keys.length ; i < iMax ; i ++ )
	{
		if ( v[ keys[ i ] ] !== undefined )
		{
			if ( i ) { runtime.str += ',' ; }
			stringifyString( keys[ i ] , runtime ) ;
			runtime.str += ':' ;
			stringifyAnyType( v[ keys[ i ] ] , runtime ) ;
		}
	}
	
	runtime.str += '}' ;
}



// A bit slower than stringifyStrictObject(), but use slightly less memory
function stringifyStrictObjectMemory( v , runtime )
{
	var k , comma = false ;
	
	runtime.str += '{' ;
	
	for ( k in v )
	{
		if ( v[ k ] !== undefined && v.hasOwnProperty( k ) )
		//if ( v[ k ] !== undefined )	// Faster, but include properties of the prototype
		{
			if ( comma ) { runtime.str += ',' ; }
			stringifyString( k , runtime ) ;
			runtime.str += ':' ;
			stringifyAnyType( v[ k ] , runtime ) ;
			comma = true ;
		}
	}
	
	runtime.str += '}' ;
}



module.exports = function stringify( v )
{
	if ( v === undefined ) { return undefined ; }
	
	var runtime = {
		str: ''
	} ;
	
	stringifyAnyType( v , runtime ) ;
	return runtime.str ;
} ;



