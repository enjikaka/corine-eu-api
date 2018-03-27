# Corine EU API

This is a serverless function that gives you the Corine Land Cover information of a lat/long pair or an [Open Location Code](https://github.com/google/open-location-code).

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
