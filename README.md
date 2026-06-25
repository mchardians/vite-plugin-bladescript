# vite-plugin-blade-script

[![npm version](https://img.shields.io/npm/v/vite-plugin-blade-script.svg?style=flat-square)](https://www.npmjs.com/package/vite-plugin-blade-script)
[![npm downloads](https://img.shields.io/npm/dm/vite-plugin-blade-script.svg?style=flat-square)](https://www.npmjs.com/package/vite-plugin-blade-script)
[![License](https://img.shields.io/npm/l/vite-plugin-blade-script.svg?style=flat-square)](https://www.npmjs.com/package/vite-plugin-blade-script)

A Vite plugin companion for the Laravel `bladescript` package. It enables a high-performance monolith architecture by automatically discovering and registering your Vanilla JavaScript, TypeScript, or CSS files as independent Rollup entry points (Micro-Bundling).

## Features

* **Auto-Discovery (Zero Config):** Automatically scans your directory using glob patterns and registers every matched file as an independent entry point in Vite.
* **Micro-Bundling:** Prevents giant `app.js` payloads. Only the exact components imported in your Blade views are downloaded by the client.
* **Signature Preservation:** Enforces `preserveEntrySignatures: 'strict'` to prevent Rollup from stripping out your Vanilla JS Custom Elements or global functions during production builds.
* **Single Responsibility:** Defers alias resolution entirely to Vite's native engine for maximum speed and compatibility.

## Requirements

* Node.js 18+
* Vite 5+ or 6+
* [mchardians/bladescript](https://packagist.org/packages/mchardians/bladescript) (Companion Composer package)

## Installation

Install the package via npm as a development dependency:

```bash

npm install vite-plugin-blade-script --save-dev

```

## Usage

Add the plugin to your vite.config.js file.

### 1. Default Configuration

By default, the plugin uses the pattern resources/js//*.js to find all your JavaScript files and injects them into Rollup's input array.

```javascript

import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import laravelBladeJs from 'vite-plugin-blade-script';

export default defineConfig({
    resolve: {
        // Use Vite's native alias resolution for maximum performance
        alias: {
            '@/': '/resources/js/',
            '#/': '/resources/css/',
            '~/': '/resources/media/'
        }
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css'],
            refresh: true,
        }),
        laravelBladeJs(), // Automatically discovers resources/js/**/*.js
    ],
});

```

### 2. Custom Entry Points

You can customize the discovery pattern using the entryPoints option. It accepts a single glob string or an array of glob strings, allowing you to bundle JS, TS, and modular CSS simultaneously.

```javascript

import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import laravelBladeJs from 'vite-plugin-blade-script';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css'],
            refresh: true,
        }),
        laravelBladeJs({
            // Pass an array of glob patterns to discover multiple asset types
            entryPoints: [
                'frontend/scripts/**/*.js',
                'frontend/components/**/*.ts',
                'frontend/styles/modules/**/*.css'
            ]
        }),
    ],
});

```

## License

The MIT License (MIT). Please see the License File for more information.
