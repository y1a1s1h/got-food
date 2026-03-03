import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'


function DisplayMap()
{
const example_banks = [
    { position: [38.9072, -77.0369], name: "Washington DC" },
    { position: [39.0840, -77.6413], name: "Loudoun County" },
    { position: [38.8816, -77.0910], name: "Arlington" },
  ]
  return(
    <MapContainer center={example_banks[0].position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}
    whenReady={(map) => {
    const bounds = example_banks.map(loc => loc.position)
    map.target.fitBounds(bounds, { padding: [10, 10] })
    }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {example_banks.map((loc, index) => (
          <Marker key={index} position={loc.position}>
          <Popup>{loc.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
  )
}

function App() {
  const [count, setCount] = useState(0)
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <div style = {{height: '50%', width: '50%', marginLeft: '10%', marginRight: '10%'}}>
        <DisplayMap/>
      </div>
    </div>
  )
}

export default App
