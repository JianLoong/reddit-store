import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import './Search'
import Search from './Search';

function App() {

  return (
    <div className="App">
      <div className="d-flex flex-column h-100">
        <main className="flex-shrink-0">
          <nav className="navbar sticky-top navbar-light bg-light">
            <div className="container-fluid">
              <a className="navbar-brand" href="./index.html">Data Visualisation of the subreddit <em>AITA</em></a>
            </div>
          </nav>
          <div className="container-lg">
            <p>Click <a href="https://jianliew.me/projects">here</a> to return to projects page</p>
            <p>
              The subreddit describes itself as…
            </p>
            <em>
              A catharsis for the frustrated moral philosopher in all of us, and a place to finally find out if
              you
              were wrong in an
              argument that’s been bothering you. Tell us about any non-violent conflict you have experienced;
              give us
              both sides of the
              story, and find out if you’re right, or you’re the asshole. See our Best Of “Most Controversial” at
              /r/AITAFiltered!
            </em>
            <p>For more information please visit the project page <a
              href="http://github.com/JianLoong/reddit-store">here</a>
            </p>

            <p>You can also search the submissions using <a href="./search.html">this</a>
            </p>
            <div className="">
              <Search />
            </div>
            </div>
        </main>




        <footer className="footer mt-auto py-3 bg-light">
          <div className="container">
            <span className="text-muted">Project can be found <a href="https://github.com/JianLoong/reddit-store">here</a> .
              This website updates itself every second hour based on data from Reddit</span>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default App;
