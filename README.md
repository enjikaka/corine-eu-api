# Corine API

This is a serverless function that gives you the Corine Land Cover information of an [Open Location Code](https://github.com/google/open-location-code) within the EU.

Uses the [Corine Land Cover data from 2012 provided by the European Environment Agency](http://copernicus.discomap.eea.europa.eu/arcgis/rest/services/Corine/CLC2012_WM/MapServer).

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
