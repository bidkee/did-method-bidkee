import { useEffect, useState } from 'react';
import './App.css';

interface DemoResult {
    bid: { did: string; signatures: { issuer: string; holder: string }; fields: { static: Record<string, any>; dynamic: Record<string, any> } };
    isValid: boolean;
}

function App() {
    const [data, setData] = useState<DemoResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [didInput, setDidInput] = useState('');

    const fetchBid = (did: string = '') => {
        setLoading(true);
        setError(null);
        const url = did ? `http://localhost:3001/api/demo?did=${encodeURIComponent(did)}` : 'http://localhost:3001/api/demo';
        fetch(url)
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const text = await response.text();
                try {
                    const json = JSON.parse(text);
                    setData(json);
                } catch (e) {
                    throw new Error(`JSON parse error: ${text.slice(0, 50)}...`);
                }
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchBid(); // ³õÊ¼¼ÓÔØÊ¾Àý BID
    }, []);

    const handleVerify = () => {
        fetchBid(didInput);
    };

    const getValidationMessage = (bid: DemoResult['bid'], isValid: boolean) => {
        if (isValid) return 'BID is valid';
        if (!bid.did.startsWith('did:bidkee:kaspa:') && !bid.did.startsWith('kaspa:')) {
            return 'Invalid DID format: Must start with kaspa: or did:bidkee:kaspa:';
        }
        if (!bid.signatures.issuer || !bid.signatures.holder) {
            return 'Invalid signatures';
        }
        return 'BID verification failed';
    };

    return (
        <div className="App">
            <h1>Bidkee DID Demo</h1>
            <div className="input-section">
                <input
                    type="text"
                    value={didInput}
                    onChange={(e) => setDidInput(e.target.value)}
                    placeholder="Enter DID (e.g., kaspa:qrk9...)"
                />
                <button onClick={handleVerify} disabled={loading}>
                    {loading ? 'Loading...' : 'Verify BID'}
                </button>
            </div>
            {error && <p className="error">Error: {error}</p>}
            {loading && <p>Loading...</p>}
            {data && !loading && (
                <div className="bid-info">
                    <p><strong>DID:</strong> {data.bid.did}</p>
                    <p><strong>Valid:</strong> {data.isValid ? 'Yes' : 'No'}</p>
                    <p><strong>Validation Message:</strong> {getValidationMessage(data.bid, data.isValid)}</p>
                    <p><strong>Issuer Signature:</strong> {data.bid.signatures.issuer}</p>
                    <p><strong>Holder Signature:</strong> {data.bid.signatures.holder}</p>
                </div>
            )}
        </div>
    );
}

export default App;
