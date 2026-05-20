import { useEffect } from 'react';
import { load } from '@2gis/mapgl';
import { useMapglContext } from './MapglContext';
import { useControlRotateClockwise } from './useControlRotateClockwise';
import { ControlRotateCounterclockwise } from './ControlRotateConterclockwise';
import { MapWrapper } from './MapWrapper';
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import geoData from './data/tverskaia-oblast.json';

export const MAP_CENTER = [35.917421, 56.858745];

export default function Mapgl() {
    const { setMapglContext } = useMapglContext();

    useEffect(() => {
        let map: mapgl.Map | undefined = undefined;

        load().then((mapgl) => {
            map = new mapgl.Map('map-container', {
                center: MAP_CENTER,
                zoom: 12,
                key: 'a3dde53f-81d3-4f90-ba73-12824734c793',
                //style: '83a6b2e5-e269-4607-ba06-255accc03f44',
                maxPitch: 70,
                styleState: { globeEnabled: true },
            });

            const data: FeatureCollection<Geometry, GeoJsonProperties> = 
                geoData as FeatureCollection<Geometry, GeoJsonProperties>;

            const source = new mapgl.GeoJsonSource(map, {
                data,
                attributes: { visible: true },
            });

            const layer = {
                id: 'dtp-data-layer',
                filter: [
                    'all',
                    [
                        'match',
                        ['sourceAttr', 'visible'],
                        [true],
                        true,
                        false,
                    ],
                ],
                type: 'point',
                minzoom: 10,
                maxzoom: 20,
                style: {
                    iconImage: 'crash',
                    iconWidth: 16,
                    iconHeight: 16,
                    textField: [
                        'concat',
                        ['get', 'category'],
                        '|',
                        ['get', 'severity']
                    ],
                    textFont: ['Noto_Sans'],
                    textSize: 8,
                    textColor: '#ff6600',
                    textHaloColor: '#ffffff',
                    textHaloWidth: 2,
                    iconPriority: 100,
                    textPriority: 100,
                },
            };

            const layer2 = {
                id: 'dtp-heatmap-layer', 
                filter: [
                    'match',
                    ['sourceAttr', 'visible'],
                    [true],
                    true,
                    false,
                ],
                type: 'heatmap',
                minzoom: 10,
                maxzoom: 20,
                style: {
                    color: [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0, 'rgba(133, 92, 117, 0)',
                        0.2, 'rgba(133, 92, 117, 0.6)',
                        0.35, 'rgba(175, 111, 69, 0.7)',
                        0.5, 'rgba(217, 175, 107, 0.8)',
                        0.65, 'rgba(115, 111, 76, 0.9)',
                        0.8, 'rgba(104, 133, 92, 0.95)',
                        1, 'rgba(175, 100, 88, 1)', 
                    ],
                    radius: 20,
                    intensity: 0.8,
                    opacity: 0.8,
                    downscale: 1,
                },
            };
            map.on('styleload', () => {
                map?.addLayer(layer2);
            });

            map.on('styleload', () => {
                map?.addLayer(layer);

                if (!map) return;

                map.patchStyleState({ realisticSkyEnabled: true });

                map.patchStyleState({ lightingMode: 'sun' });
                map.setLighting({
                    direction: [0, -1, 0.5],
                    intensity: 0.2,
                    color: '#f8f403'
                });

                map.setTrafficLayer({
                    enabled: true,
                    style: 'default',
                });

                map.patchStyleState({ immersiveRoadsOn: true });
                
            });

            setMapglContext({
                mapglInstance: map,
                mapgl,
            });
        });

        return () => {
            map && map.destroy();
            setMapglContext({ mapglInstance: undefined, mapgl: undefined });
        };
    }, [setMapglContext]);

    useControlRotateClockwise();

    return (
        <>
            <MapWrapper />
            <ControlRotateCounterclockwise />
        </>
    );
}