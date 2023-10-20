import { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Zoom, MousePosition } from "ol/control";
import { createStringXY } from "ol/coordinate";
import { Feature } from "ol";
import { Point } from "ol/geom";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import VectorLayer from "ol/layer/Vector";
import Icon from "ol/style/Icon";
import Overlay from "ol/Overlay";
import Popup from "./Popup";

function MapComponent() {
    const zoomControl = new Zoom({});
    const mousePositionControl = new MousePosition({
        coordinateFormat: createStringXY(4),
        projection: "EPSG:4326",
        className: "custom-mouse-position",
    });
    const mapTargetElement = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<Map | undefined>();
    const position = useRef([0, 0]);
    const features = useRef<Feature[]>([]);
    const popup = useRef<Overlay | null>(null);
    const flag = useRef<boolean>(false)
    const popupElement = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const map = new Map({
            layers: [new TileLayer({ source: new OSM() })],
            controls: [zoomControl, mousePositionControl],
            view: new View({
                center: [0, 0],
                zoom: 0,
                minZoom: 0,
                maxZoom: 28,
            }),
        });
     

        const vectorSource = new VectorSource({
            features: [],
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: new Style({
                image: new Icon({
                    src: "public/Pin.svg",
                    width: 30,
                    height: 30,
                }),
            }),
        });

        map.addLayer(vectorLayer);

        map.setTarget(mapTargetElement.current || "");
        setMap(map);

        map.on("click", (e) => {
            position.current = e.coordinate;
            vectorSource.clear();
            const newFeature = new Feature({
                geometry: new Point(position.current),
            });
            vectorSource.addFeatures([newFeature]);
            if (popup.current)
            popupElement.current!.style.display = "none";
           
        });

        map.on('dblclick',(e)=>{
            if (popup.current) {
                popupElement.current!.style.display = "block"
                // Set the content of the popup to the clicked coordinates
                const coordinates = createStringXY(4)(position.current);
                
                popupElement.current!.textContent = `Coordinates: ${coordinates}`;
                popup.current.setPosition(position.current);
            }
        })

        if(!popupElement.current)
        return (console.log('problem'))
        popup.current = new Overlay({
            element: popupElement.current,
            positioning: "bottom-center",
            // offset: [0, -10],
            // stopEvent: true,
        });
        map.addOverlay(popup.current);

        return () => map.setTarget("");
    }, []);

    const rotateLeft = (map: Map|undefined) => {
        const view = map!.getView();
        const currentRotation = view.getRotation();
        const newRotation = currentRotation + Math.PI / 6;
        view.setRotation(newRotation);
    };

    const rotateRight = (map: Map|undefined) => {
        const view = map!.getView();
        const currentRotation = view.getRotation();
        const newRotation = currentRotation - Math.PI / 6;
        view.setRotation(newRotation);
    };

 

    return (
        <>
        <Popup popupRef = {popupElement}/>
            <div
                ref={mapTargetElement}
                style={{ width: "100%", height: "400px" }}
            >
                
                <button onClick={() => rotateLeft(map)}>Rotate Left</button>
                <button onClick={() => rotateRight(map)}>Rotate Right</button>
            </div>
        </>
    );
}

export default MapComponent;
