import { useState, useEffect } from 'react'
import polkadotLogo from './assets/Polkadot_Token_White.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { createClient } from "polkadot-api";
// because we saved the metadata from a well-known chain polkadot during `bun papi add...` installation
import { dot } from "@polkadot-api/descriptors";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";

// simple interface representing our example staking info object from polkadot
interface DotInfo {
  staking: { index: number; start: bigint | undefined; } | undefined,
  nominatorsCount: number,
}

function App() {
  // state management here to toggle the view of our example info and storing this in our local state.
  const [dotInfo, setDotInfo] = useState<DotInfo>();
  const [visible, setVisible] = useState(false);

  // create the client with a websocket connecton
  const client = createClient(
  // we recommend adding this enhancer
  withPolkadotSdkCompat(
    getWsProvider("wss://dot-rpc.stakeworld.io")
  )
);

  // get the safely typed API from the `client`
  const api = client.getTypedApi(dot);
  // get staking info
  const staking = api.query.Staking.ActiveEra.getValue();
  // get nominators count
  const nominatorsCount = api.query.Staking.CounterForNominators.getValue();

  // const _stuff = api.query.Balances.Locks.getValues();

  // With the `client`, you can get information such as subscribing to the last
  // block to get the latest hash:
  client.finalizedBlock$.subscribe((finalizedBlock) =>
    console.log(finalizedBlock.number, finalizedBlock.hash)
  );

  useEffect(() => {
    async function returnStakinInfo() {
      const value = await staking;
      const valueForNominators = await nominatorsCount;

      const values: DotInfo = {
        staking: value,
        nominatorsCount: valueForNominators,
      };
      setDotInfo(values);
    }
    returnStakinInfo();
  }, [nominatorsCount, staking, visible]);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={polkadotLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + PAPI</h1>
      <div className="card">
        <button onClick={() => setVisible(true)}>click to see info</button>

        <div className="card">
          {visible && dotInfo ? (
            <div>
              <p>
                <em>Staking era so far: {dotInfo.staking?.index} days</em>
              </p>
              <p>
                <em>Total Nominators: {dotInfo.nominatorsCount}</em>
              </p>
            </div>
          ) : (
            visible && <i className="fa fa-circle-o-notch fa-spin"></i>
          )}
        </div>
      </div>
    </>
  );
}

export default App
