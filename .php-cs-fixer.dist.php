<?php

use PhpCsFixer\Config;
use PhpCsFixer\Finder;

$rules = [
    '@PER-CS2.0' => true,
    '@PER-CS2.0:risky' => true,
    'function_declaration' => [
        'closure_fn_spacing' => 'one',
    ],
];


$finder = Finder::create()
    ->in([
        'app',
        'config',
        'database',
        'public',
        'resources',
        'routes',
        'tests'
    ])
    ->name('*.php')
    ->notName('**/*.blade.php')
    ->ignoreDotFiles(true)
    ->ignoreVCS(true);

return (new Config())
    ->setFinder($finder)
    ->setRules($rules)
    ->setRiskyAllowed(true)
    ->setUsingCache(true);
