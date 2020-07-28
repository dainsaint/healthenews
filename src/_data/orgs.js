const fetch = require('node-fetch');
const Cache = require("@11ty/eleventy-cache-assets");
// const { GoogleSpreadsheet } = require("google-spreadsheet");
const Sugar = require('sugar');



// require('dotenv').config();
Sugar.extend();

let organizations = [
  {
    name: "inquirer",
    id: "1tJsIJli8HUAaDb38wF8xps4N-6xoRkHERNbOyjsepdY"
  }
]


let worksheetTemplate = (id) => `https://spreadsheets.google.com/feeds/worksheets/${id}/public/full?alt=json`;


let fetchSheet = async( url ) => {
  // let r = await fetch( url );
  // let json = await r.json();
  let json = await Cache( url, {
    duration: "1m",
    type: 'json'
  });

  return json;
}


let fetchOrgSheet = async ( id ) => {
  return await fetchSheet( worksheetTemplate( id ) );
}

let parseEntry = ( entry ) => {
  let keys = entry
    .filter( x => +x.gs$cell.row == 1 )
    .map( x => x.gs$cell.$t );


  let transformed = entry
    .filter( x => +x.gs$cell.row != 1 )
    .reduce( (acc, cur) => {
    // console.log( cur );
    let val = cur.gs$cell;
    let obj = acc[ +val.row - 2 ] || {};
    obj[ keys[ +val.col - 1 ] ] = val.$t;
    acc[ +val.row - 2] = obj;
    return acc;
  }, [])

  return transformed;
}


module.exports = async function()
{
  let response = [];
  for( let i = 0; i < organizations.length; i++ )
  {
    let org = await fetchOrgSheet( organizations[i].id );
    // console.log( org );

    let result = {
      slug: organizations[i].name
    };

    for( let j = 0; j < org.feed.entry.length; j++ )
    {
      let entry = org.feed.entry[j];

      let contentLink = entry.link.find( x => x.rel == "http://schemas.google.com/spreadsheets/2006#cellsfeed").href + "?alt=json";

      let content = await fetchSheet( contentLink );
      let transformed = parseEntry( content.feed.entry );

      result[ entry.title.$t ] = entry.title.$t == "Info" ? transformed.first() : transformed;
    }

    response.push( result );
  }


  console.log( response );


  return response;
}
