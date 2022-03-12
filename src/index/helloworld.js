import React from "react";
import ReactDOM from "react-dom";
import './index.less';
import img from './image/logo_pc@2x.png'

export const Helloworld = () => {
    return (
        <div className="container">
            Hello world
            <img src={img} alt=""/>
            <p style={{color: "#110199"}}>124411</p>
        </div>
    )
}

ReactDOM.render(
    <Helloworld/>,
    document.getElementById('root')
)

