import '../styles/globals.css'
import store from '../store'
import { Provider } from 'react-redux'
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
      <Analytics />
    </Provider>
  )
}
