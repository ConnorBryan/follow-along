import React from "react";
import ReactDOM from "react-dom";

import Main from "./components/Main";
import data from "./data/doc2.json";

ReactDOM.render(<Main {...data} />, document.getElementById("root"));
