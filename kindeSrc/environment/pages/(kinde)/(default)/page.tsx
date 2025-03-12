"use server";

import { Liquid, Template, TagToken } from "liquidjs";
import React, { JSX } from "react";
import { renderToString } from "react-dom/server.browser";
import { getKindeWidget } from "@kinde/infrastructure";

/**
 * Page configuration settings for server components
 */
export const pageSettings = {
  bindings: {
    url: {},
  },
};

/**
 * Event object interface
 */
interface RequestEvent {
  url?: {
    search?: string;
  };
}

/**
 * Creates a new Liquid.js engine instance with configured settings
 * @returns {Liquid} Configured Liquid engine instance
 */
function createLiquidEngine(): Liquid {
  return new Liquid({
    extname: ".liquid",
    cache: process.env.NODE_ENV === "production",
    strictFilters: true,
    strictVariables: true,
    trimTagRight: true,
    trimTagLeft: true,
  });
}

/**
 * Custom tag interface
 */
interface CustomTag {
  tagToken: TagToken;
  parse: (tagToken: TagToken) => void;
  render: () => Promise<string>;
}

/**
 * Register custom tags and filters
 * @param {Liquid} engine - The Liquid engine instance
 */
function registerCustomTags(engine: Liquid): void {
  // Register the React component as a custom tag
  engine.registerTag("kindeWidget", {
    parse: function (tagToken: TagToken): void {
      this.tagToken = tagToken;
    },
    render: async function (): Promise<string> {
      return renderToString(getKindeWidget());
    },
  } as CustomTag);

  // Register additional custom filters if needed
  engine.registerFilter("customFilter", (value: string): string => {
    // Custom filter implementation
    return value;
  });
}

/**
 * Renders a template using Liquid.js with provided data
 * @param {string} templateString - The Liquid template string
 * @param {Record<string, any>} data - Data to pass to the template
 * @returns {Promise<string>} Rendered HTML
 */
async function renderLiquidTemplate(
  templateString: string,
  data: Record<string, any>
): Promise<string> {
  const engine = createLiquidEngine();
  registerCustomTags(engine);

  const template: Template[] = engine.parse(templateString);
  return engine.render(template, data);
}

/**
 * Renders a people list using Liquid templates
 * @param {string[]} people - Array of people names
 * @returns {Promise<string>} Rendered HTML
 */
async function renderPeopleList(people: string[]): Promise<string> {
  const templateString = `
    <ul class="people-list">
      {%- for person in people %}
      <li class="person-item">
        <a href="{{ person | prepend: "https://example.com/" }}">
          {{ person | capitalize }}
        </a>
        {% kindeWidget %}
      </li>
      {%- endfor %}
    </ul>
  `;

  return renderLiquidTemplate(templateString, { people });
}

/**
 * Main request handler
 * @param {RequestEvent} event - Request event
 * @returns {Promise<string>} Rendered response
 */
export default async function handleRequest(
  event: RequestEvent
): Promise<string> {
  // Process query parameters
  const paramsString =
    event?.url?.search || "q=URLUtils.searchParams&topic=api";
  // const params = processUrlParams(paramsString);

  // Render the people list
  const renderedContent = await renderPeopleList(["John", "Jane", "Alex"]);

  return renderedContent;
}
