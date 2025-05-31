#!/usr/bin/env node

/**
 * Local SEO System Test
 * Tests the automated SEO components without requiring PHP backend
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Automated SEO System Tests...\n');

// Test 1: Check if all required files exist
function testFileExistence() {
    console.log('📁 Test 1: Checking file existence...');
    
    const requiredFiles = [
        'src/components/seo/AutomatedSEOEngine.js',
        'src/services/CSVReportProcessor.js', 
        'src/components/seo/SEOAutomationDashboard.js',
        'public/php/seo_automation.php',
        'sql_seo_upgrades.sql',
        '/reports/Queries.csv',
        '/reports/Pages.csv',
        '/reports/Countries.csv',
        '/reports/Devices.csv'
    ];
    
    let allFilesExist = true;
    
    requiredFiles.forEach(file => {
        const fullPath = path.join(__dirname, file);
        if (fs.existsSync(fullPath)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file} - MISSING`);
            allFilesExist = false;
        }
    });
    
    return allFilesExist;
}

// Test 2: Validate CSV file structure
function testCSVStructure() {
    console.log('\n📊 Test 2: Validating CSV structure...');
    
    const csvFiles = [
        { name: 'Queries.csv', expectedHeaders: ['Top queries', 'Clicks', 'Impressions', 'CTR', 'Position'] },
        { name: 'Pages.csv', expectedHeaders: ['Top pages', 'Clicks', 'Impressions', 'CTR', 'Position'] },
        { name: 'Countries.csv', expectedHeaders: ['Country', 'Clicks', 'Impressions', 'CTR', 'Position'] },
        { name: 'Devices.csv', expectedHeaders: ['Device', 'Clicks', 'Impressions', 'CTR', 'Position'] }
    ];
    
    let allCSVsValid = true;
    
    csvFiles.forEach(({ name, expectedHeaders }) => {
        const filePath = path.join(__dirname, 'public', 'reports', name);
        
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const firstLine = content.split('\n')[0];
            const headers = firstLine.split(',').map(h => h.trim());
            
            const hasRequiredHeaders = expectedHeaders.every(expected => 
                headers.some(header => header.toLowerCase().includes(expected.toLowerCase()))
            );
            
            if (hasRequiredHeaders) {
                console.log(`✅ ${name} - Structure valid`);
            } else {
                console.log(`❌ ${name} - Invalid structure`);
                console.log(`   Expected: ${expectedHeaders.join(', ')}`);
                console.log(`   Found: ${headers.join(', ')}`);
                allCSVsValid = false;
            }
        } else {
            console.log(`❌ ${name} - File not found`);
            allCSVsValid = false;
        }
    });
    
    return allCSVsValid;
}

// Test 3: Check package.json for dependencies
function testDependencies() {
    console.log('\n📦 Test 3: Checking dependencies...');
    
    const packageJsonPath = path.join(__dirname, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
        console.log('❌ package.json not found');
        return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = ['papaparse', 'react', 'react-dom'];
    let allDepsPresent = true;
    
    requiredDeps.forEach(dep => {
        if (dependencies[dep]) {
            console.log(`✅ ${dep} - v${dependencies[dep]}`);
        } else {
            console.log(`❌ ${dep} - MISSING`);
            allDepsPresent = false;
        }
    });
    
    return allDepsPresent;
}

// Test 4: Simulate CSV data processing
function testCSVProcessing() {
    console.log('\n🔄 Test 4: Simulating CSV processing...');
    
    try {
        // Read and parse Queries.csv
        const queriesPath = path.join(__dirname, 'public', 'reports', 'Queries.csv');
        
        if (!fs.existsSync(queriesPath)) {
            console.log('❌ Queries.csv not found for processing test');
            return false;
        }
        
        const content = fs.readFileSync(queriesPath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            console.log('❌ Queries.csv has insufficient data');
            return false;
        }
        
        // Parse header and first data row
        const headers = lines[0].split(',').map(h => h.trim());
        const firstDataRow = lines[1].split(',').map(cell => cell.trim());
        
        console.log(`✅ Successfully parsed ${lines.length - 1} data rows`);
        console.log(`✅ Headers: ${headers.join(', ')}`);
        console.log(`✅ Sample row: ${firstDataRow.join(', ')}`);
        
        // Validate data types
        if (firstDataRow.length >= 5) {
            const keyword = firstDataRow[0];
            const clicks = parseInt(firstDataRow[1]);
            const impressions = parseInt(firstDataRow[2]);
            const ctr = parseFloat(firstDataRow[3].replace('%', ''));
            const position = parseFloat(firstDataRow[4]);
            
            if (keyword && !isNaN(clicks) && !isNaN(impressions) && !isNaN(ctr) && !isNaN(position)) {
                console.log(`✅ Data types valid - Keyword: "${keyword}", Clicks: ${clicks}, CTR: ${ctr}%`);
                
                // Calculate priority score (same as AutomatedSEOEngine.js)
                const priorityScore = (clicks * 2) + (impressions * 0.1) + ((21 - position) * 0.5) + (ctr * 10);
                console.log(`✅ Priority score calculation: ${priorityScore.toFixed(2)}`);
                
                return true;
            }
        }
        
        console.log('❌ Data validation failed');
        return false;
        
    } catch (error) {
        console.log(`❌ CSV processing error: ${error.message}`);
        return false;
    }
}

// Test 5: Validate SQL structure
function testSQLStructure() {
    console.log('\n🗄️ Test 5: Validating SQL structure...');
    
    const sqlPath = path.join(__dirname, 'sql_seo_upgrades.sql');
    
    if (!fs.existsSync(sqlPath)) {
        console.log('❌ sql_seo_upgrades.sql not found');
        return false;
    }
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Check for required tables
    const requiredTables = [
        'seo_keywords',
        'seo_pages', 
        'seo_optimizations',
        'seo_insights',
        'seo_content_gaps',
        'seo_international_opportunities',
        'seo_device_performance',
        'seo_automated_reports'
    ];
    
    let allTablesPresent = true;
    
    requiredTables.forEach(table => {
        if (sqlContent.includes(`CREATE TABLE ${table}`)) {
            console.log(`✅ Table: ${table}`);
        } else {
            console.log(`❌ Table: ${table} - MISSING`);
            allTablesPresent = false;
        }
    });
    
    // Check for views and procedures
    const hasViews = sqlContent.includes('CREATE VIEW');
    const hasProcedures = sqlContent.includes('CREATE PROCEDURE');
    const hasTriggers = sqlContent.includes('CREATE TRIGGER');
    
    console.log(`${hasViews ? '✅' : '❌'} Database views`);
    console.log(`${hasProcedures ? '✅' : '❌'} Stored procedures`);
    console.log(`${hasTriggers ? '✅' : '❌'} Database triggers`);
    
    return allTablesPresent && hasViews && hasProcedures && hasTriggers;
}

// Test 6: Component structure validation
function testComponentStructure() {
    console.log('\n⚛️ Test 6: Validating React component structure...');
    
    const components = [
        'src/components/seo/AutomatedSEOEngine.js',
        'src/services/CSVReportProcessor.js',
        'src/components/seo/SEOAutomationDashboard.js'
    ];
    
    let allComponentsValid = true;
    
    components.forEach(componentPath => {
        const fullPath = path.join(__dirname, componentPath);
        
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Check for React imports and exports
            const hasReactImport = content.includes('import React') || content.includes('from \'react\'');
            const hasExport = content.includes('export default') || content.includes('module.exports');
            const hasProps = content.includes('props') || content.includes('useState') || content.includes('useEffect');
            
            if (hasReactImport && hasExport) {
                console.log(`✅ ${path.basename(componentPath)} - Valid React component`);
            } else {
                console.log(`❌ ${path.basename(componentPath)} - Invalid structure`);
                allComponentsValid = false;
            }
        } else {
            console.log(`❌ ${path.basename(componentPath)} - File not found`);
            allComponentsValid = false;
        }
    });
    
    return allComponentsValid;
}

// Run all tests
async function runAllTests() {
    console.log('🤖 Automated SEO System - Local Integration Test');
    console.log('=' .repeat(50));
    
    const results = {
        fileExistence: testFileExistence(),
        csvStructure: testCSVStructure(),
        dependencies: testDependencies(),
        csvProcessing: testCSVProcessing(),
        sqlStructure: testSQLStructure(),
        componentStructure: testComponentStructure()
    };
    
    console.log('\n📋 Test Results Summary:');
    console.log('=' .repeat(30));
    
    Object.entries(results).forEach(([testName, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    
    console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! The automated SEO system is ready for deployment.');
        console.log('\n📝 Next Steps:');
        console.log('1. Manually verify PHP backend and database connection');
        console.log('2. Test the dashboard in your React app');
        console.log('3. Upload fresh CSV files from Google Search Console');
        console.log('4. Monitor the automation dashboard for processing');
    } else {
        console.log('⚠️  Some tests failed. Please address the issues above before proceeding.');
    }
    
    return passedTests === totalTests;
}

// Execute tests
runAllTests().then(success => {
    process.exit(success ? 0 : 1);
});
