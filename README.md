# Corine EU API

This is a cloud function that gives you the Corine Land Cover information of a lat/long pair or an [Open Location Code](https://github.com/google/open-location-code).

Only works within the EU as this uses the [Corine Land Cover data from 2012](http://copernicus.discomap.eea.europa.eu/arcgis/rest/services/Corine/CLC2012_WM/MapServer) provided by the [European Environment Agency](https://www.eea.europa.eu/).

## Get Corine Land Cover information

### Request

**URL**: `/`

**Method**: `GET`

**URL params**: `?lat=[number]&long=[number]` || `?ocl=[OpenLocationCode]`

### Response

Code: `200 OK`
Content:

```
{
  openLocationCode: OpenLocationCode,
  terrainTypes: string[]
}
```

#### Example response

```

{
  "openLocationCode":"9FFJMH3M+4G",
  "terrainTypes": [
    "Industrial or commercial units",
    "Water bodies"
  ]
}
```

[View 9FFJMH3M+4G on the map](https://plus.codes/9FFJMH3M+4G)

## Deployment

Prerequisite:
- Install the [Webtask CLI](https://github.com/auth0/wt-cli) and set it up
- Install the node 8 profile as per [this article](https://tomasz.janczuk.org/2017/09/auth0-webtasks-and-node-8.html)

Run `npm run deploy` to publish the webtask cloud function.
