import React from "react";
import "./bento-portfolio-style.css"
import { StartupsSeguidas } from "../startups-seguidas/startups-seguidas";
import TablaPortfolio from "@/app/ui/components/tabla-portfolio/tabla-portfolio";

export function BentoGridPortfolio() {
  return (
    <div className="contenedor3">
        <div className="bento3">
            <div className="apartado3">
                <p>1</p>
            </div>
            <button className="apartado3">
                <p>2</p>
            </button>
            <StartupsSeguidas></StartupsSeguidas>
            <div className="apartado3">
                <p>4</p>
            </div>
            <div className="apartado3">
                <TablaPortfolio></TablaPortfolio>
            </div>
            <div className="apartado3">
                <p>6</p>
            </div>
        </div>
  </div>
  )
};
