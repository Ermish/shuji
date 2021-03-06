import { convertMarkdownFilesToJSXFiles, convertMarkdownToJSX, convertMarkdownToJSXAndObject, frontMatterModeEnum } from './transformer'
import { getMdFilesFromFolder, writeJsxFiles } from './fileProcessor'

const { performance, PerformanceObserver  } = require("perf_hooks")
import { logger } from './logger'

export interface Options {
    inputPath?: string
    outputPath?: string
    frontMatterMode?: string, 
    reactHeadContextName?: string
    reactHeadContextVarName?: string
    deleteExistingOutputFolder?: boolean
}

export const defaultOptions = {
    inputPath: 'markdown',
    outputPath: 'jsxMarkdown',
    frontMatterMode: 'reacthelmet', 
    reactHeadContextName: 'ReactHeadContext',
    reactHeadContextVarName: 'reactHead',
    deleteExistingOutputFolder: false
}

//TODO: use typescript types
const perfObserver = new PerformanceObserver((items:any) => {
    items.getEntries().forEach((entry:any) => {
        const trimmedDuration = parseInt(entry.duration)
        const currentTime = new Date().toLocaleTimeString()
        if(entry.name == 'shuji') {
            logger().info(`Done in ${trimmedDuration}ms. [${currentTime}]`)
            return
        }

        logger().debug(`${entry.name} finished in ${trimmedDuration}ms. [${currentTime}]`)
    })
})

perfObserver.observe({ entryTypes: ["measure"], buffer: true })


/**
 * Transforms a Markdown string to JSX, including any html in the markdown.
 * Also, front-matter will be extracted in js variables in the react component.
 * @param {string} `markdownString` Markdown string to convert to a react component that may also include front-matter and html.
 * @param {componentName} `componentName` Name of new react component.
 * @param {Options} User defined options to override default values.
 * @return {Promise<number>} files
 */
 export const transformMarkdownString = async (markdownString: string, componentName?: string, options?: Options): Promise<string> => {
    try {
        performance.mark('start-shuji')

        const userOptions = {
            ...defaultOptions,
            ...options,
            frontMatterMode: options?.frontMatterMode?.toLowerCase() ?? defaultOptions.frontMatterMode
        }

        const jsxString = await convertMarkdownToJSX(markdownString, userOptions.frontMatterMode as frontMatterModeEnum, userOptions.reactHeadContextVarName, userOptions.reactHeadContextName, componentName)

        return jsxString
    } catch (error) {
        return ''
    } finally {
        performance.mark('end-shuji')
        performance.measure('shuji', 'start-shuji', 'end-shuji')
    }
}

/**
 * Transforms a Markdown string to JSX, including any html in the markdown.
 * Also, front-matter will be extracted in js variables in the react component.
 * @param {string} `markdownString` Markdown string to convert to a react component that may also include front-matter and html.
 * @param {Options} User defined options to override default values.
 * @return {Promise<number>} files
 */
 export const transformMarkdownStringWithFMObject = async (markdownString: string, componentName?: string, options?: Options): Promise<[string, object]> => {
    try {
        performance.mark('start-shuji')

        const userOptions = {
            ...defaultOptions,
            ...options,
            frontMatterMode: options?.frontMatterMode?.toLowerCase() ?? defaultOptions.frontMatterMode
        }

        const [jsxString, frontMatterObject] = await convertMarkdownToJSXAndObject(markdownString, userOptions.reactHeadContextVarName, userOptions.reactHeadContextName, componentName)

        return [jsxString, frontMatterObject]
    } catch (error) {
        throw new Error(`Any error occurred transforming your markdown: ${error}`)
    } finally {
        performance.mark('end-shuji')
        performance.measure('shuji', 'start-shuji', 'end-shuji')
    }
}


/**
 * Transforms Markdown files to JSX files, including any html in the markdown.
 * Also, front-matter will be extracted in js variables in the react component.
 * @param {Options} User defined options to override default values.
 * @return {Promise<number>} files
 */
export const transformMarkdownFiles = async (options?: Options): Promise<number> => {
    try {
        performance.mark('start-shuji')

        const userOptions = {
            ...defaultOptions,
            ...options,
            frontMatterMode: options?.frontMatterMode?.toLowerCase() ?? defaultOptions.frontMatterMode
        }

        const mdFiles = await getMdFilesFromFolder(userOptions.inputPath)
        const jsxStrings = await convertMarkdownFilesToJSXFiles(mdFiles, userOptions.frontMatterMode as frontMatterModeEnum, userOptions.reactHeadContextVarName, userOptions.reactHeadContextName)
        await writeJsxFiles(userOptions.outputPath, jsxStrings, userOptions.deleteExistingOutputFolder)

        return 0
    } catch (error) {
        return 1
    } finally {
        performance.mark('end-shuji')
        performance.measure('shuji', 'start-shuji', 'end-shuji')
    }
}
