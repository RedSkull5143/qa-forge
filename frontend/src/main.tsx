import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import 'aws-amplify/auth/enable-oauth-listener'
import './index.css'
import App from './App.tsx'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-south-1_gSKVs64YA',
      userPoolClientId: '2e66h8b6n8jj2tj1hju94e942l',
      loginWith: {
        oauth: {
          domain: 'ap-south-1gskvs64ya.auth.ap-south-1.amazoncognito.com',
          scopes: ['openid', 'email'],
          redirectSignIn: ['http://localhost:5173/'],
          redirectSignOut: ['http://localhost:5173/'],
          responseType: 'code'
        }
      }
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
