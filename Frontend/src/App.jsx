import { useState } from 'react'
import {
  BrowserRouter ,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import {v4 as uuIdV4} from 'uuid';
import TextEditor from './Pages/TextEditor';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Switch>
        <Route path='/' exact>
          <Redirect to={`document/${uuIdV4()}`}></Redirect>
        </Route>

        <Route path='/document/:id'>
          <TextEditor />
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

export default App
