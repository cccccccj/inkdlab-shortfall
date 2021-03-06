"use strict";
/// <reference path="scripts/types/ambient.d.ts" />
var cp = require("child_process");
var path = require("path");
var fs = require("fs");
var originalGulp = require("gulp");
var helpMaker = require("gulp-help");
var runSequence = require("run-sequence");
var concat = require("gulp-concat");
var clone = require("gulp-clone");
var newer = require("gulp-newer");
var tsc = require("gulp-typescript");
var insert = require("gulp-insert");
var sourcemaps = require("gulp-sourcemaps");
var del = require("del");
var mkdirP = require("mkdirp");
var minimist = require("minimist");
var browserify = require("browserify");
var through2 = require("through2");
var merge2 = require("merge2");
var intoStream = require("into-stream");
var os = require("os");
var fold = require("travis-fold");
var gulp = helpMaker(originalGulp);
var mochaParallel = require("./scripts/mocha-parallel.js");
var runTestsInParallel = mochaParallel.runTestsInParallel;
var cmdLineOptions = minimist(process.argv.slice(2), {
    boolean: ["debug", "light", "colors", "lint", "soft"],
    string: ["browser", "tests", "host", "reporter"],
    alias: {
        d: "debug",
        t: "tests",
        test: "tests",
        r: "reporter",
        color: "colors",
        f: "files",
        file: "files"
    },
    default: {
        soft: false,
        colors: process.env.colors || process.env.color || true,
        debug: process.env.debug || process.env.d,
        host: process.env.TYPESCRIPT_HOST || process.env.host || "node",
        browser: process.env.browser || process.env.b || "IE",
        tests: process.env.test || process.env.tests || process.env.t,
        light: process.env.light || false,
        reporter: process.env.reporter || process.env.r,
        lint: process.env.lint || true,
        files: process.env.f || process.env.file || process.env.files || "",
    }
});
function exec(cmd, args, complete, error) {
    if (complete === void 0) { complete = (function () { }); }
    if (error === void 0) { error = (function () { }); }
    console.log(cmd + " " + args.join(" "));
    // TODO (weswig): Update child_process types to add windowsVerbatimArguments to the type definition
    var subshellFlag = isWin ? "/c" : "-c";
    var command = isWin ? [possiblyQuote(cmd)].concat(args) : [cmd + " " + args.join(" ")];
    var ex = cp.spawn(isWin ? "cmd" : "/bin/sh", [subshellFlag].concat(command), { stdio: "inherit", windowsVerbatimArguments: true });
    ex.on("exit", function (code) { return code === 0 ? complete() : error(/*e*/ undefined, code); });
    ex.on("error", error);
}
function possiblyQuote(cmd) {
    return cmd.indexOf(" ") >= 0 ? "\"" + cmd + "\"" : cmd;
}
var useDebugMode = true;
var host = cmdLineOptions["host"];
// Constants
var compilerDirectory = "src/compiler/";
var harnessDirectory = "src/harness/";
var libraryDirectory = "src/lib/";
var scriptsDirectory = "scripts/";
var docDirectory = "doc/";
var builtDirectory = "built/";
var builtLocalDirectory = "built/local/";
var LKGDirectory = "lib/";
var copyright = "CopyrightNotice.txt";
var compilerFilename = "tsc.js";
var LKGCompiler = path.join(LKGDirectory, compilerFilename);
var builtLocalCompiler = path.join(builtLocalDirectory, compilerFilename);
var nodeModulesPathPrefix = path.resolve("./node_modules/.bin/");
var isWin = /^win/.test(process.platform);
var mocha = path.join(nodeModulesPathPrefix, "mocha") + (isWin ? ".cmd" : "");
var es2015LibrarySources = [
    "es2015.core.d.ts",
    "es2015.collection.d.ts",
    "es2015.generator.d.ts",
    "es2015.iterable.d.ts",
    "es2015.promise.d.ts",
    "es2015.proxy.d.ts",
    "es2015.reflect.d.ts",
    "es2015.symbol.d.ts",
    "es2015.symbol.wellknown.d.ts"
];
var es2015LibrarySourceMap = es2015LibrarySources.map(function (source) {
    return { target: "lib." + source, sources: ["header.d.ts", source] };
});
var es2016LibrarySource = ["es2016.array.include.d.ts"];
var es2016LibrarySourceMap = es2016LibrarySource.map(function (source) {
    return { target: "lib." + source, sources: ["header.d.ts", source] };
});
var es2017LibrarySource = [
    "es2017.object.d.ts",
    "es2017.sharedmemory.d.ts"
];
var es2017LibrarySourceMap = es2017LibrarySource.map(function (source) {
    return { target: "lib." + source, sources: ["header.d.ts", source] };
});
var hostsLibrarySources = ["dom.generated.d.ts", "webworker.importscripts.d.ts", "scripthost.d.ts"];
var librarySourceMap = [
    // Host library
    { target: "lib.dom.d.ts", sources: ["header.d.ts", "dom.generated.d.ts"] },
    { target: "lib.dom.iterable.d.ts", sources: ["header.d.ts", "dom.iterable.d.ts"] },
    { target: "lib.webworker.d.ts", sources: ["header.d.ts", "webworker.generated.d.ts"] },
    { target: "lib.scripthost.d.ts", sources: ["header.d.ts", "scripthost.d.ts"] },
    // JavaScript library
    { target: "lib.es5.d.ts", sources: ["header.d.ts", "es5.d.ts"] },
    { target: "lib.es2015.d.ts", sources: ["header.d.ts", "es2015.d.ts"] },
    { target: "lib.es2016.d.ts", sources: ["header.d.ts", "es2016.d.ts"] },
    { target: "lib.es2017.d.ts", sources: ["header.d.ts", "es2017.d.ts"] },
    // JavaScript + all host library
    { target: "lib.d.ts", sources: ["header.d.ts", "es5.d.ts"].concat(hostsLibrarySources) },
    { target: "lib.es6.d.ts", sources: ["header.d.ts", "es5.d.ts"].concat(es2015LibrarySources, hostsLibrarySources, "dom.iterable.d.ts") }
].concat(es2015LibrarySourceMap, es2016LibrarySourceMap, es2017LibrarySourceMap);
var libraryTargets = librarySourceMap.map(function (f) {
    return path.join(builtLocalDirectory, f.target);
});
var _loop_1 = function (i) {
    var entry = librarySourceMap[i];
    var target = libraryTargets[i];
    var sources = [copyright].concat(entry.sources.map(function (s) {
        return path.join(libraryDirectory, s);
    }));
    gulp.task(target, false, [], function () {
        return gulp.src(sources)
            .pipe(newer(target))
            .pipe(concat(target, { newLine: "" }))
            .pipe(gulp.dest("."));
    });
};
for (var i in libraryTargets) {
    _loop_1(i);
}
var configureNightlyJs = path.join(scriptsDirectory, "configureNightly.js");
var configureNightlyTs = path.join(scriptsDirectory, "configureNightly.ts");
var packageJson = "package.json";
var versionFile = path.join(compilerDirectory, "core.ts");
function needsUpdate(source, dest) {
    if (typeof source === "string" && typeof dest === "string") {
        if (fs.existsSync(dest)) {
            var outTime = fs.statSync(dest).mtime;
            var inTime = fs.statSync(source).mtime;
            if (+inTime <= +outTime) {
                return false;
            }
        }
    }
    else if (typeof source === "string" && typeof dest !== "string") {
        var inTime = fs.statSync(source).mtime;
        for (var _i = 0, dest_1 = dest; _i < dest_1.length; _i++) {
            var filepath = dest_1[_i];
            if (fs.existsSync(filepath)) {
                var outTime = fs.statSync(filepath).mtime;
                if (+inTime > +outTime) {
                    return true;
                }
            }
            else {
                return true;
            }
        }
        return false;
    }
    else if (typeof source !== "string" && typeof dest === "string") {
        if (fs.existsSync(dest)) {
            var outTime = fs.statSync(dest).mtime;
            for (var _a = 0, source_1 = source; _a < source_1.length; _a++) {
                var filepath = source_1[_a];
                if (fs.existsSync(filepath)) {
                    var inTime = fs.statSync(filepath).mtime;
                    if (+inTime > +outTime) {
                        return true;
                    }
                }
                else {
                    return true;
                }
            }
            return false;
        }
    }
    else if (typeof source !== "string" && typeof dest !== "string") {
        for (var i = 0; i < source.length; i++) {
            if (!dest[i]) {
                continue;
            }
            if (fs.existsSync(dest[i])) {
                var outTime = fs.statSync(dest[i]).mtime;
                var inTime = fs.statSync(source[i]).mtime;
                if (+inTime > +outTime) {
                    return true;
                }
            }
            else {
                return true;
            }
        }
        return false;
    }
    return true;
}
function getCompilerSettings(base, useBuiltCompiler) {
    var copy = {};
    copy.noEmitOnError = true;
    copy.noImplicitAny = true;
    copy.noImplicitThis = true;
    copy.pretty = true;
    copy.types = [];
    for (var key in base) {
        copy[key] = base[key];
    }
    if (!useDebugMode) {
        if (copy.removeComments === undefined)
            copy.removeComments = true;
        copy.newLine = "lf";
    }
    else {
        copy.preserveConstEnums = true;
    }
    if (useBuiltCompiler === true) {
        copy.typescript = require("./built/local/typescript.js");
    }
    else if (useBuiltCompiler === false) {
        copy.typescript = require("./lib/typescript.js");
    }
    return copy;
}
gulp.task(configureNightlyJs, false, [], function () {
    var settings = {
        declaration: false,
        removeComments: true,
        noResolve: false,
        stripInternal: false,
    };
    return gulp.src(configureNightlyTs)
        .pipe(sourcemaps.init())
        .pipe(tsc(settings))
        .pipe(sourcemaps.write(path.dirname(configureNightlyJs)))
        .pipe(gulp.dest(path.dirname(configureNightlyJs)));
});
// Nightly management tasks
gulp.task("configure-nightly", "Runs scripts/configureNightly.ts to prepare a build for nightly publishing", [configureNightlyJs], function (done) {
    exec(host, [configureNightlyJs, packageJson, versionFile], done, done);
});
gulp.task("publish-nightly", "Runs `npm publish --tag next` to create a new nightly build on npm", ["LKG"], function () {
    return runSequence("clean", "useDebugMode", "runtests", function (done) {
        exec("npm", ["publish", "--tag", "next"], done, done);
    });
});
var importDefinitelyTypedTestsDirectory = path.join(scriptsDirectory, "importDefinitelyTypedTests");
var importDefinitelyTypedTestsJs = path.join(importDefinitelyTypedTestsDirectory, "importDefinitelyTypedTests.js");
var importDefinitelyTypedTestsTs = path.join(importDefinitelyTypedTestsDirectory, "importDefinitelyTypedTests.ts");
gulp.task(importDefinitelyTypedTestsJs, false, [], function () {
    var settings = getCompilerSettings({
        declaration: false,
        removeComments: true,
        noResolve: false,
        stripInternal: false,
        outFile: importDefinitelyTypedTestsJs
    }, /*useBuiltCompiler*/ false);
    return gulp.src(importDefinitelyTypedTestsTs)
        .pipe(sourcemaps.init())
        .pipe(tsc(settings))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("."));
});
gulp.task("importDefinitelyTypedTests", "Runs scripts/importDefinitelyTypedTests/importDefinitelyTypedTests.ts to copy DT's tests to the TS-internal RWC tests", [importDefinitelyTypedTestsJs], function (done) {
    exec(host, [importDefinitelyTypedTestsJs, "./", "../DefinitelyTyped"], done, done);
});
gulp.task("lib", "Builds the library targets", libraryTargets);
// Generate diagnostics
var processDiagnosticMessagesJs = path.join(scriptsDirectory, "processDiagnosticMessages.js");
var processDiagnosticMessagesTs = path.join(scriptsDirectory, "processDiagnosticMessages.ts");
var diagnosticMessagesJson = path.join(compilerDirectory, "diagnosticMessages.json");
var diagnosticInfoMapTs = path.join(compilerDirectory, "diagnosticInformationMap.generated.ts");
var generatedDiagnosticMessagesJSON = path.join(compilerDirectory, "diagnosticMessages.generated.json");
var builtGeneratedDiagnosticMessagesJSON = path.join(builtLocalDirectory, "diagnosticMessages.generated.json");
// processDiagnosticMessages script
gulp.task(processDiagnosticMessagesJs, false, [], function () {
    var settings = getCompilerSettings({
        declaration: false,
        removeComments: true,
        noResolve: false,
        stripInternal: false,
        outFile: processDiagnosticMessagesJs
    }, /*useBuiltCompiler*/ false);
    return gulp.src(processDiagnosticMessagesTs)
        .pipe(newer(processDiagnosticMessagesJs))
        .pipe(sourcemaps.init())
        .pipe(tsc(settings))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("."));
});
// The generated diagnostics map; built for the compiler and for the "generate-diagnostics" task
gulp.task(diagnosticInfoMapTs, [processDiagnosticMessagesJs], function (done) {
    if (needsUpdate(diagnosticMessagesJson, [generatedDiagnosticMessagesJSON, diagnosticInfoMapTs])) {
        exec(host, [processDiagnosticMessagesJs, diagnosticMessagesJson], done, done);
    }
    else {
        done();
    }
});
gulp.task(builtGeneratedDiagnosticMessagesJSON, [diagnosticInfoMapTs], function (done) {
    if (fs.existsSync(builtLocalDirectory) && needsUpdate(generatedDiagnosticMessagesJSON, builtGeneratedDiagnosticMessagesJSON)) {
        fs.writeFileSync(builtGeneratedDiagnosticMessagesJSON, fs.readFileSync(generatedDiagnosticMessagesJSON));
    }
    done();
});
gulp.task("generate-diagnostics", "Generates a diagnostic file in TypeScript based on an input JSON file", [diagnosticInfoMapTs]);
var servicesFile = path.join(builtLocalDirectory, "typescriptServices.js");
var standaloneDefinitionsFile = path.join(builtLocalDirectory, "typescriptServices.d.ts");
var nodePackageFile = path.join(builtLocalDirectory, "typescript.js");
var nodeDefinitionsFile = path.join(builtLocalDirectory, "typescript.d.ts");
var nodeStandaloneDefinitionsFile = path.join(builtLocalDirectory, "typescript_standalone.d.ts");
var copyrightContent;
function prependCopyright(outputCopyright) {
    if (outputCopyright === void 0) { outputCopyright = !useDebugMode; }
    return insert.prepend(outputCopyright ? (copyrightContent || (copyrightContent = fs.readFileSync(copyright).toString())) : "");
}
gulp.task(builtLocalCompiler, false, [servicesFile], function () {
    var localCompilerProject = tsc.createProject("src/compiler/tsconfig.json", getCompilerSettings({}, /*useBuiltCompiler*/ true));
    return localCompilerProject.src()
        .pipe(newer(builtLocalCompiler))
        .pipe(sourcemaps.init())
        .pipe(localCompilerProject())
        .pipe(prependCopyright())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("."));
});
gulp.task(servicesFile, false, ["lib", "generate-diagnostics"], function () {
    var servicesProject = tsc.createProject("src/services/tsconfig.json", getCompilerSettings({ removeComments: false }, /*useBuiltCompiler*/ false));
    var _a = servicesProject.src()
        .pipe(newer(servicesFile))
        .pipe(sourcemaps.init())
        .pipe(servicesProject()), js = _a.js, dts = _a.dts;
    var completedJs = js.pipe(prependCopyright())
        .pipe(sourcemaps.write("."));
    var completedDts = dts.pipe(prependCopyright(/*outputCopyright*/ true))
        .pipe(insert.transform(function (contents, file) {
        file.path = standaloneDefinitionsFile;
        return contents.replace(/^(\s*)(export )?const enum (\S+) {(\s*)$/gm, "$1$2enum $3 {$4");
    }));
    return merge2([
        completedJs,
        completedJs.pipe(clone())
            .pipe(insert.transform(function (content, file) { return (file.path = nodePackageFile, content); })),
        completedDts,
        completedDts.pipe(clone())
            .pipe(insert.transform(function (content, file) {
            file.path = nodeDefinitionsFile;
            return content + "\r\nexport = ts;";
        }))
            .pipe(gulp.dest(".")),
        completedDts.pipe(clone())
            .pipe(insert.transform(function (content, file) {
            file.path = nodeStandaloneDefinitionsFile;
            return content.replace(/declare (namespace|module) ts/g, 'declare module "typescript"');
        }))
    ]).pipe(gulp.dest("."));
});
// cancellationToken.js
var cancellationTokenJs = path.join(builtLocalDirectory, "cancellationToken.js");
gulp.task(cancellationTokenJs, false, [servicesFile], function () {
    var cancellationTokenProject = tsc.createProject("src/server/cancellationToken/tsconfig.json", getCompilerSettings({}, /*useBuiltCompiler*/ true));
    return cancellationTokenProject.src()
        .pipe(newer(cancellationTokenJs))
        .pipe(sourcemaps.init())
        .pipe(cancellationTokenProject())
        .pipe(prependCopyright())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(builtLocalDirectory));
});
// typingsInstallerFile.js
var typingsInstallerJs = path.join(builtLocalDirectory, "typingsInstaller.js");
gulp.task(typingsInstallerJs, false, [servicesFile], function () {
    var cancellationTokenProject = tsc.createProject("src/server/typingsInstaller/tsconfig.json", getCompilerSettings({}, /*useBuiltCompiler*/ true));
    return cancellationTokenProject.src()
        .pipe(newer(typingsInstallerJs))
        .pipe(sourcemaps.init())
        .pipe(cancellationTokenProject())
        .pipe(prependCopyright())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("."));
});
var serverFile = path.join(builtLocalDirectory, "tsserver.js");
gulp.task(serverFile, false, [servicesFile, typingsInstallerJs, cancellationTokenJs], function () {
    var serverProject = tsc.createProject("src/server/tsconfig.json", getCompilerSettings({}, /*useBuiltCompiler*/ true));
    return serverProject.src()
        .pipe(newer(serverFile))
        .pipe(sourcemaps.init())
        .pipe(serverProject())
        .pipe(prependCopyright())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("."));
});
var tsserverLibraryFile = path.join(builtLocalDirectory, "tsserverlibrary.js");
var tsserverLibraryDefinitionFile = path.join(builtLocalDirectory, "tsserverlibrary.d.ts");
gulp.task(tsserverLibraryFile, false, [servicesFile], function (done) {
    var serverLibraryProject = tsc.createProject("src/server/tsconfig.library.json", getCompilerSettings({}, /*useBuiltCompiler*/ true));
    var _a = serverLibraryProject.src()
        .pipe(sourcemaps.init())
        .pipe(newer(tsserverLibraryFile))
        .pipe(serverLibraryProject()), js = _a.js, dts = _a.dts;
    return merge2([
        js.pipe(prependCopyright())
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest(".")),
        dts.pipe(prependCopyright())
            .pipe(gulp.dest("."))
    ]);
});
gulp.task("lssl", "Builds language service server library", [tsserverLibraryFile]);
gulp.task("local", "Builds the full compiler and services", [builtLocalCompiler, servicesFile, serverFile, builtGeneratedDiagnosticMessagesJSON, tsserverLibraryFile]);
gulp.task("tsc", "Builds only the compiler", [builtLocalCompiler]);
// Generate Markdown spec
var word2mdJs = path.join(scriptsDirectory, "word2md.js");
var word2mdTs = path.join(scriptsDirectory, "word2md.ts");
var specWord = path.join(docDirectory, "TypeScript Language Specification.docx");
var specMd = path.join(docDirectory, "spec.md");
gulp.task(word2mdJs, false, [], function () {
    var settings = getCompilerSettings({
        outFile: word2mdJs
    }, /*useBuiltCompiler*/ false);
    return gulp.src(word2mdTs)
        .pipe(newer(word2mdJs))
        .pipe(sourcemaps.init())
        .pipe(tsc(settings))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("."));
});
gulp.task(specMd, false, [word2mdJs], function (done) {
    var specWordFullPath = path.resolve(specWord);
    var specMDFullPath = path.resolve(specMd);
    var cmd = "cscript //nologo " + word2mdJs + " \"" + specWordFullPath + "\" " + "\"" + specMDFullPath + "\"";
    console.log(cmd);
    cp.exec(cmd, function () {
        done();
    });
});
gulp.task("generate-spec", "Generates a Markdown version of the Language Specification", [specMd]);
gulp.task("clean", "Cleans the compiler output, declare files, and tests", [], function () {
    return del([builtDirectory]);
});
gulp.task("useDebugMode", false, [], function (done) { useDebugMode = true; done(); });
gulp.task("dontUseDebugMode", false, [], function (done) { useDebugMode = false; done(); });
gulp.task("VerifyLKG", false, [], function () {
    var expectedFiles = [builtLocalCompiler, servicesFile, serverFile, nodePackageFile, nodeDefinitionsFile, standaloneDefinitionsFile, tsserverLibraryFile, tsserverLibraryDefinitionFile, typingsInstallerJs, cancellationTokenJs].concat(libraryTargets);
    var missingFiles = expectedFiles.filter(function (f) {
        return !fs.existsSync(f);
    });
    if (missingFiles.length > 0) {
        throw new Error("Cannot replace the LKG unless all built targets are present in directory " + builtLocalDirectory +
            ". The following files are missing:\n" + missingFiles.join("\n"));
    }
    // Copy all the targets into the LKG directory
    return gulp.src(expectedFiles).pipe(gulp.dest(LKGDirectory));
});
gulp.task("LKGInternal", false, ["lib", "local"]);
gulp.task("LKG", "Makes a new LKG out of the built js files", ["clean", "dontUseDebugMode"], function () {
    return runSequence("LKGInternal", "VerifyLKG");
});
// Task to build the tests infrastructure using the built compiler
var run = path.join(builtLocalDirectory, "run.js");
gulp.task(run, false, [servicesFile], function () {
    var testProject = tsc.createProject("src/harness/tsconfig.json", getCompilerSettings({}, /*useBuiltCompiler*/ true));
    return testProject.src()
        .pipe(newer(run))
        .pipe(sourcemaps.init())
        .pipe(testProject())
        .pipe(sourcemaps.write(".", { includeContent: false, sourceRoot: "../../" }))
        .pipe(gulp.dest("."));
});
var internalTests = "internal/";
var localBaseline = "tests/baselines/local/";
var refBaseline = "tests/baselines/reference/";
var localRwcBaseline = path.join(internalTests, "baselines/rwc/local");
var refRwcBaseline = path.join(internalTests, "baselines/rwc/reference");
var localTest262Baseline = path.join(internalTests, "baselines/test262/local");
gulp.task("tests", "Builds the test infrastructure using the built compiler", [run]);
gulp.task("tests-debug", "Builds the test sources and automation in debug mode", function () {
    return runSequence("useDebugMode", "tests");
});
function deleteTemporaryProjectOutput() {
    return del(path.join(localBaseline, "projectOutput/"));
}
var savedNodeEnv;
function setNodeEnvToDevelopment() {
    savedNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
}
function restoreSavedNodeEnv() {
    process.env.NODE_ENV = savedNodeEnv;
}
var testTimeout = 40000;
function runConsoleTests(defaultReporter, runInParallel, done) {
    var lintFlag = cmdLineOptions["lint"];
    cleanTestDirs(function (err) {
        if (err) {
            console.error(err);
            failWithStatus(err, 1);
        }
        var debug = cmdLineOptions["debug"];
        var tests = cmdLineOptions["tests"];
        var light = cmdLineOptions["light"];
        var testConfigFile = "test.config";
        if (fs.existsSync(testConfigFile)) {
            fs.unlinkSync(testConfigFile);
        }
        var workerCount, taskConfigsFolder;
        if (runInParallel) {
            // generate name to store task configuration files
            var prefix = os.tmpdir() + "/ts-tests";
            var i = 1;
            do {
                taskConfigsFolder = prefix + i;
                i++;
            } while (fs.existsSync(taskConfigsFolder));
            fs.mkdirSync(taskConfigsFolder);
            workerCount = process.env.workerCount || os.cpus().length;
        }
        if (tests || light || taskConfigsFolder) {
            writeTestConfigFile(tests, light, taskConfigsFolder, workerCount);
        }
        if (tests && tests.toLocaleLowerCase() === "rwc") {
            testTimeout = 400000;
        }
        var colors = cmdLineOptions["colors"];
        var reporter = cmdLineOptions["reporter"] || defaultReporter;
        // timeout normally isn"t necessary but Travis-CI has been timing out on compiler baselines occasionally
        // default timeout is 2sec which really should be enough, but maybe we just need a small amount longer
        if (!runInParallel) {
            var args = [];
            if (debug) {
                args.push("--debug-brk");
            }
            args.push("-R", reporter);
            if (tests) {
                args.push("-g", "\"" + tests + "\"");
            }
            if (colors) {
                args.push("--colors");
            }
            else {
                args.push("--no-colors");
            }
            args.push("-t", testTimeout);
            args.push(run);
            setNodeEnvToDevelopment();
            exec(mocha, args, lintThenFinish, function (e, status) {
                finish(e, status);
            });
        }
        else {
            // run task to load all tests and partition them between workers
            var args = [];
            args.push("-R", "min");
            if (colors) {
                args.push("--colors");
            }
            else {
                args.push("--no-colors");
            }
            args.push(run);
            setNodeEnvToDevelopment();
            runTestsInParallel(taskConfigsFolder, run, { testTimeout: testTimeout, noColors: colors === " --no-colors " }, function (err) {
                // last worker clean everything and runs linter in case if there were no errors
                del(taskConfigsFolder).then(function () {
                    if (!err) {
                        lintThenFinish();
                    }
                    else {
                        finish(err);
                    }
                });
            });
        }
    });
    function failWithStatus(err, status) {
        if (err) {
            console.log(err);
        }
        done(err || status);
        process.exit(status);
    }
    function lintThenFinish() {
        if (lintFlag) {
            runSequence("lint", finish);
        }
        else {
            finish();
        }
    }
    function finish(error, errorStatus) {
        restoreSavedNodeEnv();
        deleteTemporaryProjectOutput().then(function () {
            if (error !== undefined || errorStatus !== undefined) {
                failWithStatus(error, errorStatus);
            }
            else {
                done();
            }
        });
    }
}
gulp.task("runtests-parallel", "Runs all the tests in parallel using the built run.js file. Optional arguments are: --t[ests]=category1|category2|... --d[ebug]=true.", ["build-rules", "tests"], function (done) {
    runConsoleTests("min", /*runInParallel*/ true, done);
});
gulp.task("runtests", "Runs the tests using the built run.js file. Optional arguments are: --t[ests]=regex --r[eporter]=[list|spec|json|<more>] --d[ebug]=true --color[s]=false --lint=true.", ["build-rules", "tests"], function (done) {
    runConsoleTests("mocha-fivemat-progress-reporter", /*runInParallel*/ false, done);
});
var nodeServerOutFile = "tests/webTestServer.js";
var nodeServerInFile = "tests/webTestServer.ts";
gulp.task(nodeServerOutFile, false, [servicesFile], function () {
    var settings = getCompilerSettings({ module: "commonjs" }, /*useBuiltCompiler*/ true);
    return gulp.src(nodeServerInFile)
        .pipe(newer(nodeServerOutFile))
        .pipe(sourcemaps.init())
        .pipe(tsc(settings))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(path.dirname(nodeServerOutFile)));
});
var convertMap = require("convert-source-map");
var sorcery = require("sorcery");
gulp.task("browserify", "Runs browserify on run.js to produce a file suitable for running tests in the browser", [servicesFile], function (done) {
    var testProject = tsc.createProject("src/harness/tsconfig.json", getCompilerSettings({ outFile: "../../built/local/bundle.js" }, /*useBuiltCompiler*/ true));
    return testProject.src()
        .pipe(newer("built/local/bundle.js"))
        .pipe(sourcemaps.init())
        .pipe(testProject())
        .pipe(through2.obj(function (file, enc, next) {
        var originalMap = file.sourceMap;
        var prebundledContent = file.contents.toString();
        // Make paths absolute to help sorcery deal with all the terrible paths being thrown around
        originalMap.sources = originalMap.sources.map(function (s) { return path.resolve(s); });
        // intoStream (below) makes browserify think the input file is named this, so this is what it puts in the sourcemap
        originalMap.file = "built/local/_stream_0.js";
        browserify(intoStream(file.contents), { debug: true })
            .bundle(function (err, res) {
            // assumes file.contents is a Buffer
            var maps = JSON.parse(convertMap.fromSource(res.toString(), /*largeSource*/ true).toJSON());
            delete maps.sourceRoot;
            maps.sources = maps.sources.map(function (s) { return path.resolve(s === "_stream_0.js" ? "built/local/_stream_0.js" : s); });
            // Strip browserify's inline comments away (could probably just let sorcery do this, but then we couldn't fix the paths)
            file.contents = new Buffer(convertMap.removeComments(res.toString()));
            var chain = sorcery.loadSync("built/local/bundle.js", {
                content: {
                    "built/local/_stream_0.js": prebundledContent,
                    "built/local/bundle.js": file.contents.toString()
                },
                sourcemaps: {
                    "built/local/_stream_0.js": originalMap,
                    "built/local/bundle.js": maps,
                }
            });
            var finalMap = chain.apply();
            file.sourceMap = finalMap;
            next(undefined, file);
        });
    }))
        .pipe(sourcemaps.write(".", { includeContent: false }))
        .pipe(gulp.dest("."));
});
function cleanTestDirs(done) {
    // Clean the local baselines & Rwc baselines directories
    del([
        localBaseline,
        localRwcBaseline,
    ]).then(function () {
        mkdirP(localRwcBaseline, function (err) {
            if (err)
                done(err);
            mkdirP(localTest262Baseline, function () {
                if (err)
                    done(err);
                mkdirP(localBaseline, function (err) { return done(err); });
            });
        });
    });
}
// used to pass data from jake command line directly to run.js
function writeTestConfigFile(tests, light, taskConfigsFolder, workerCount) {
    var testConfigContents = JSON.stringify({ test: tests ? [tests] : undefined, light: light, workerCount: workerCount, taskConfigsFolder: taskConfigsFolder });
    console.log("Running tests with config: " + testConfigContents);
    fs.writeFileSync("test.config", testConfigContents);
}
gulp.task("runtests-browser", "Runs the tests using the built run.js file like 'gulp runtests'. Syntax is gulp runtests-browser. Additional optional parameters --tests=[regex], --browser=[chrome|IE]", ["browserify", nodeServerOutFile], function (done) {
    cleanTestDirs(function (err) {
        if (err) {
            console.error(err);
            done(err);
            process.exit(1);
        }
        host = "node";
        var tests = cmdLineOptions["tests"];
        var light = cmdLineOptions["light"];
        var testConfigFile = "test.config";
        if (fs.existsSync(testConfigFile)) {
            fs.unlinkSync(testConfigFile);
        }
        if (tests || light) {
            writeTestConfigFile(tests, light);
        }
        var args = [nodeServerOutFile];
        if (cmdLineOptions["browser"]) {
            args.push(cmdLineOptions["browser"]);
        }
        if (tests) {
            args.push(JSON.stringify(tests));
        }
        exec(host, args, done, done);
    });
});
gulp.task("generate-code-coverage", "Generates code coverage data via istanbul", ["tests"], function (done) {
    exec("istanbul", ["cover", "node_modules/mocha/bin/_mocha", "--", "-R", "min", "-t", testTimeout.toString(), run], done, done);
});
function getDiffTool() {
    var program = process.env["DIFF"];
    if (!program) {
        console.error("Add the 'DIFF' environment variable to the path of the program you want to use.");
        process.exit(1);
    }
    return program;
}
gulp.task("diff", "Diffs the compiler baselines using the diff tool specified by the 'DIFF' environment variable", function (done) {
    exec(getDiffTool(), [refBaseline, localBaseline], done, done);
});
gulp.task("diff-rwc", "Diffs the RWC baselines using the diff tool specified by the 'DIFF' environment variable", function (done) {
    exec(getDiffTool(), [refRwcBaseline, localRwcBaseline], done, done);
});
gulp.task("baseline-accept", "Makes the most recent test results the new baseline, overwriting the old baseline", function () {
    return baselineAccept("");
});
function baselineAccept(subfolder) {
    if (subfolder === void 0) { subfolder = ""; }
    return merge2(baselineCopy(subfolder), baselineDelete(subfolder));
}
function baselineCopy(subfolder) {
    if (subfolder === void 0) { subfolder = ""; }
    return gulp.src(["tests/baselines/local/" + subfolder + "/**", "!tests/baselines/local/" + subfolder + "/**/*.delete"])
        .pipe(gulp.dest(refBaseline));
}
function baselineDelete(subfolder) {
    if (subfolder === void 0) { subfolder = ""; }
    return gulp.src(["tests/baselines/local/**/*.delete"])
        .pipe(insert.transform(function (content, fileObj) {
        var target = path.join(refBaseline, fileObj.relative.substr(0, fileObj.relative.length - ".delete".length));
        del.sync(target);
        del.sync(fileObj.path);
        return "";
    }));
}
gulp.task("baseline-accept-rwc", "Makes the most recent rwc test results the new baseline, overwriting the old baseline", function () {
    return baselineAccept("rwc");
});
gulp.task("baseline-accept-test262", "Makes the most recent test262 test results the new baseline, overwriting the old baseline", function () {
    return baselineAccept("test262");
});
// Webhost
var webhostPath = "tests/webhost/webtsc.ts";
var webhostJsPath = "tests/webhost/webtsc.js";
gulp.task(webhostJsPath, false, [servicesFile], function () {
    var settings = getCompilerSettings({
        outFile: webhostJsPath
    }, /*useBuiltCompiler*/ true);
    return gulp.src(webhostPath)
        .pipe(newer(webhostJsPath))
        .pipe(sourcemaps.init())
        .pipe(tsc(settings))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(path.dirname(webhostJsPath)));
});
gulp.task("webhost", "Builds the tsc web host", [webhostJsPath], function () {
    return gulp.src(path.join(builtLocalDirectory, "lib.d.ts")).pipe(gulp.dest("tests/webhost/"));
});
// Perf compiler
var perftscPath = "tests/perftsc.ts";
var perftscJsPath = "built/local/perftsc.js";
gulp.task(perftscJsPath, false, [servicesFile], function () {
    var settings = getCompilerSettings({
        outFile: perftscJsPath
    }, /*useBuiltCompiler*/ true);
    return gulp.src(perftscPath)
        .pipe(newer(perftscJsPath))
        .pipe(sourcemaps.init())
        .pipe(tsc(settings))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("."));
});
gulp.task("perftsc", "Builds augmented version of the compiler for perf tests", [perftscJsPath]);
// Instrumented compiler
var loggedIOpath = path.join(harnessDirectory, "loggedIO.ts");
var loggedIOJsPath = path.join(builtLocalDirectory, "loggedIO.js");
gulp.task(loggedIOJsPath, false, [], function (done) {
    var temp = path.join(builtLocalDirectory, "temp");
    mkdirP(temp, function (err) {
        if (err) {
            console.error(err);
            done(err);
            process.exit(1);
        }
        ;
        exec(host, [LKGCompiler, "--outdir", temp, loggedIOpath], function () {
            fs.renameSync(path.join(temp, "/harness/loggedIO.js"), loggedIOJsPath);
            del(temp).then(function () { return done(); }, done);
        }, done);
    });
});
var instrumenterPath = path.join(harnessDirectory, "instrumenter.ts");
var instrumenterJsPath = path.join(builtLocalDirectory, "instrumenter.js");
gulp.task(instrumenterJsPath, false, [servicesFile], function () {
    var settings = getCompilerSettings({
        outFile: instrumenterJsPath
    }, /*useBuiltCompiler*/ true);
    return gulp.src(instrumenterPath)
        .pipe(newer(instrumenterJsPath))
        .pipe(sourcemaps.init())
        .pipe(tsc(settings))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("."));
});
gulp.task("tsc-instrumented", "Builds an instrumented tsc.js", [loggedIOJsPath, instrumenterJsPath, servicesFile], function (done) {
    exec(host, [instrumenterJsPath, "record", "iocapture", builtLocalDirectory, compilerFilename], done, done);
});
gulp.task("update-sublime", "Updates the sublime plugin's tsserver", ["local", serverFile], function () {
    return gulp.src([serverFile, serverFile + ".map"]).pipe(gulp.dest("../TypeScript-Sublime-Plugin/tsserver/"));
});
gulp.task("build-rules", "Compiles tslint rules to js", function () {
    var settings = getCompilerSettings({ module: "commonjs" }, /*useBuiltCompiler*/ false);
    var dest = path.join(builtLocalDirectory, "tslint");
    return gulp.src("scripts/tslint/**/*.ts")
        .pipe(newer({
        dest: dest,
        ext: ".js"
    }))
        .pipe(sourcemaps.init())
        .pipe(tsc(settings))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(dest));
});
var lintTargets = [
    "Gulpfile.ts",
    "src/compiler/**/*.ts",
    "src/harness/**/*.ts",
    "!src/harness/unittests/services/formatting/**/*.ts",
    "src/server/**/*.ts",
    "scripts/tslint/**/*.ts",
    "src/services/**/*.ts",
    "tests/*.ts", "tests/webhost/*.ts" // Note: does *not* descend recursively
];
function sendNextFile(files, child, callback, failures) {
    var file = files.pop();
    if (file) {
        console.log("Linting '" + file.path + "'.");
        child.send({ kind: "file", name: file.path });
    }
    else {
        child.send({ kind: "close" });
        callback(failures);
    }
}
function spawnLintWorker(files, callback) {
    var child = cp.fork("./scripts/parallel-lint");
    var failures = 0;
    child.on("message", function (data) {
        switch (data.kind) {
            case "result":
                if (data.failures > 0) {
                    failures += data.failures;
                    console.log(data.output);
                }
                sendNextFile(files, child, callback, failures);
                break;
            case "error":
                console.error(data.error);
                failures++;
                sendNextFile(files, child, callback, failures);
                break;
        }
    });
    sendNextFile(files, child, callback, failures);
}
gulp.task("lint", "Runs tslint on the compiler sources. Optional arguments are: --f[iles]=regex", ["build-rules"], function () {
    var fileMatcher = RegExp(cmdLineOptions["files"]);
    if (fold.isTravis())
        console.log(fold.start("lint"));
    var files = [];
    return gulp.src(lintTargets, { read: false })
        .pipe(through2.obj(function (chunk, enc, cb) {
        files.push(chunk);
        cb();
    }, function (cb) {
        files = files.filter(function (file) { return fileMatcher.test(file.path); }).sort(function (filea, fileb) { return filea.stat.size - fileb.stat.size; });
        var workerCount = (process.env.workerCount && +process.env.workerCount) || os.cpus().length;
        for (var i = 0; i < workerCount; i++) {
            spawnLintWorker(files, finished);
        }
        var completed = 0;
        var failures = 0;
        function finished(fails) {
            completed++;
            failures += fails;
            if (completed === workerCount) {
                if (fold.isTravis())
                    console.log(fold.end("lint"));
                if (failures > 0) {
                    throw new Error("Linter errors: " + failures);
                }
                else {
                    cb();
                }
            }
        }
    }));
});
gulp.task("default", "Runs 'local'", ["local"]);
gulp.task("watch", "Watches the src/ directory for changes and executes runtests-parallel.", [], function () {
    gulp.watch("src/**/*.*", ["runtests-parallel"]);
});
//# sourceMappingURL=Gulpfile.js.map