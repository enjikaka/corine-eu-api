const express = require('express');
const Webtask = require('webtask-tools');
const bodyParser = require('body-parser');
const OpenLocationCode = require('open-location-code').OpenLocationCode;
const geojsonToArcGIS = require('@esri/arcgis-to-geojson-utils').geojsonToArcGIS;
const fetch = require('node-fetch');

const olcInstance = new OpenLocationCode();

const app = express();

app.use(bodyParser.json());

/**
 * @typedef {DecodedOpenLocationCode}
 * @prop {number} latitudeCenter
 * @prop {number} longitudeCenter
 * @prop {number} latitudeLo
 * @prop {number} longitudeLo
 * @prop {number} longitudeHi
 * @prop {number} latitudeHi
 */

/**
 * @typedef {ArcGISPolygon}
 * @prop {Array.<number[]} rings
 * @prop {number} spatialReference
 */

/**
 * Converts latitude and longitue degrees to WSG84 meters.
 *
 * @param {number} longitude
 * @param {number} latitude
 * @returns {{ x: number, y: number }}
 */
function degressToMeters (longitude, latitude) {
  const x = longitude * 20037508.34 / 180;
  let y = Math.log(Math.tan((90 + latitude) * Math.PI / 360)) / (Math.PI / 180);

  y = y * 20037508.34 / 180;

  return { x, y };
}

/**
 * @param {DecodedOpenLocationCode} decodedOpenLocationCode
 * @returns {{ xmin: number, ymin: number, xmax: number, ymax: number }}
 */
function getBoundsInMeters (decodedOpenLocationCode) {
  const { x: xmin, y: ymin } = degressToMeters(decodedOpenLocationCode.longitudeLo, decodedOpenLocationCode.latitudeLo);
  const { x: xmax, y: ymax } = degressToMeters(decodedOpenLocationCode.longitudeHi, decodedOpenLocationCode.latitudeHi);

  return { xmin, ymin, xmax, ymax };
}

/**
 * @param {DecodedOpenLocationCode} decodedOpenLocationCode
 * @returns {ArcGISPolygon}
 */
function getArcGISPolygon (decodedOpenLocationCode) {
  const { xmin, ymin, xmax, ymax } = getBoundsInMeters(decodedOpenLocationCode);

  const wsg84geoJSONPolygon = {
    type: 'Polygon',
    coordinates: [[
      [xmin, ymin],
      [xmax, ymin],
      [xmax, ymax],
      [xmin, ymax],
      [xmin, ymin]
    ]]
  };

  return Object.assign({}, geojsonToArcGIS(wsg84geoJSONPolygon), { spatialReference: 102100 });
}

app.get('/', function (req, res) {
  const lat = parseFloat(req.query.lat);
  const long = parseFloat(req.query.long);

  const queryOCL = req.query.ocl ? req.query.ocl.replace(/\s/, '+') : undefined;

  const openLocationCode = queryOCL || olcInstance.encode(lat, long);
  const decodedOCL = olcInstance.decode(openLocationCode);

  const { xmin, ymin, xmax, ymax } = getBoundsInMeters(decodedOCL);
  const arcgisbbox = encodeURIComponent(`${xmin},${ymin},${xmax},${ymax}`);

  const arcgisPolygon = getArcGISPolygon(decodedOCL);

  // const imageUrl = `http://copernicus.discomap.eea.europa.eu/arcgis/rest/services/Corine/CLC2012_WM/MapServer/export?transparent=true&format=png&bbox=${arcgisbbox}&size=500%2C4&f=image`;

  const identifyUrl = `http://copernicus.discomap.eea.europa.eu/arcgis/rest/services/Corine/CLC2012_WM/MapServer/identify?geometry=${encodeURIComponent(JSON.stringify(arcgisPolygon))}&geometryType=esriGeometryPolygon&tolerance=2&mapExtent=${arcgisbbox}&imageDisplay=10%2C10%2C96&returnGeometry=false&f=pjson`;
  const layerInfoURL = 'http://copernicus.discomap.eea.europa.eu/arcgis/rest/services/Corine/CLC2012_WM/MapServer/0?f=json';

  const tilePromise = fetch(identifyUrl).then(r => r.json());
  const layerPromise = fetch(layerInfoURL).then(r => r.json());

  Promise.all([
    tilePromise,
    layerPromise
  ]).then(([tileData, layerData]) => {
    const terrainValues = tileData.results.map(obj => obj.value);

    const terrainTypes = layerData.drawingInfo.renderer.uniqueValueInfos
      .filter(info => terrainValues.indexOf(info.value) !== -1)
      .map(info => info.label.split(':')[1].trim());

    res.send({ openLocationCode, terrainTypes });
  }).catch(error => {
    res.status(500).end(error);
  });
});

module.exports = Webtask.fromExpress(app);
