import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import './app.css';
function App() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetch('http://localhost:3001/api/demo', { method: 'GET' })
            .then(async (res) => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
            }
            if (!res.headers.get('content-type')?.includes('application/json')) {
                const text = await res.text();
                throw new Error(`�� JSON ��Ӧ: ${text.slice(0, 100)}`);
            }
            return res.json();
        })
            .then((data) => setResult(data))
            .catch((err) => setError(err.message === 'Failed to fetch' ? '��˷�����δ���У������� npm run start:server' : err.message));
    }, []);
    if (error) {
        return _jsxs("div", { style: { color: 'red' }, children: ["\uFFFD\uFFFD\uFFFD\uFFFD: ", error] });
    }
    if (!result) {
        return _jsx("div", { children: "\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD..." });
    }
    return (_jsxs("div", { className: "App", children: [_jsx("h1", { children: "Bidkee DID \uFFFD\uFFFD\uFFFD\u077F\uFFFD\uFFFD\uFFFD\u02BE" }), _jsxs("pre", { children: [_jsx("strong", { children: "CheckCode:" }), " ", result.checkCode, _jsx("br", {}), _jsx("strong", { children: "\uFFFD\uFFFD\uFFFD\u0437\uFFFD\u01E9\uFFFD\uFFFD:" }), " ", result.superordinateSignature.slice(0, 20), "...", _jsx("br", {}), _jsx("strong", { children: "\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u01E9\uFFFD\uFFFD:" }), " ", result.holderSignature.slice(0, 20), "...", _jsx("br", {}), _jsx("strong", { children: "\u01E9\uFFFD\uFFFD\uFFFD\uFFFD\u05A4\uFFFD\uFFFD\uFFFD:" }), " ", result.isValid ? 'ͨ��' : 'ʧ��', _jsx("br", {}), _jsx("strong", { children: "DID:" }), " ", result.did, _jsx("br", {}), _jsx("strong", { children: "\uFFFD\uFFFD\uFFFD\u077D\u1E79:" }), _jsx("br", {}), JSON.stringify(result.identityStructure, null, 2)] }), result.isValid ? (_jsxs("p", { style: { color: 'green' }, children: ["\uFFFD\uFFFD\uFFFD\u077F\uFFFD\uFFFD\uFFFD\u05A4\u0368\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u00FB\uFFFD ", result.identityStructure.optionalFields.dynamicData.name, "\uFFFD\uFFFD \u0237\uFFFD\u03FA\u03F7\uFFFD\uFFFD\uFFFD\uFFFD\u043A\u0373\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u057C\uFFFD\u0421\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u0228\uFFFD\u07A3\uFFFDDID: ", result.did] })) : (_jsx("p", { style: { color: 'red' }, children: "\uFFFD\uFFFD\uFFFD\u077F\uFFFD\uFFFD\uFFFD\u05A4\u02A7\uFFFD\u0723\uFFFD\uFFFD\u073E\uFFFD\uFFFD\uFFFD\uFFFD\u02A1\uFFFD" }))] }));
}
export default App;
