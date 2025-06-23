import '../styles/globals.css'
import store from '../store'
import { Provider } from 'react-redux'
import { Analytics } from '@vercel/analytics/react';
import { ConnectionProvider } from '../components/context/ConnectionContext';
export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <ConnectionProvider>
      <Component {...pageProps} />
      <Analytics />
      </ConnectionProvider>
    </Provider>
  )
}
