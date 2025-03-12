"use server";
import React from "react";
import { renderToString } from "react-dom/server.browser";
import { Liquid } from "liquidjs";

export const pageSettings = {
  bindings: {
    url: {},
  },
};

const LoginForm = () => {
  return (
    <html>
      <div></div>
    </html>
  );
};

async function kindeRenderLiquid(people) {
  const engine = new Liquid();
  const tpl = engine.parse(`
			<ul>
			{%- for person in p %}
			<li>
				<a href="{{person | prepend: "https://example.com/"}}">
				  {{ person | capitalize }}
				</a>
        <%!!! kindeLoginForm  !!!%>
			</li>
			{%- endfor %}
			</ul>
		`);
  return engine.render(tpl, { p: people });
}

export default async function handleRequest(event: any) {
  const paramsString = "q=URLUtils.searchParams&topic=api";
  const searchParams = new URLSearchParams(paramsString);
  // Iterating the search parameters
  for (const p of searchParams) {
    console.log(p);
  }

  const liquids = await kindeRenderLiquid(["John"]);

  return liquids;
}
