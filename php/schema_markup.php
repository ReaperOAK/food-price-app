/**
 * Adds rich structured data to pages
 * @param string $type The type of page ('city', 'state', 'home')
 * @param array $data Data for the structured data
 * @return string The JSON-LD schema markup
 */
function generate_schema_markup($type, $data = []) {
    $schema = [];
    
    // Basic website schema that's included on all pages
    $website_schema = [
        '@context' => 'https://schema.org',
        '@type' => 'WebSite',
        'name' => 'Today Egg Rates',
        'url' => 'https://todayeggrates.com/',
        'potentialAction' => [
            '@type' => 'SearchAction',
            'target' => 'https://todayeggrates.com/search?q={search_term_string}',
            'query-input' => 'required name=search_term_string'
        ]
    ];
    
    $schema[] = $website_schema;
    
    // Page-specific schema
    switch ($type) {
        case 'city':
            if (!empty($data['city_name']) && !empty($data['rate']) && !empty($data['date'])) {
                $city_schema = [
                    '@context' => 'https://schema.org',
                    '@type' => 'Product',
                    'name' => 'Eggs in ' . $data['city_name'],
                    'description' => 'Current egg prices and rates in ' . $data['city_name'] . '. Updated daily with wholesale and retail egg rates.',
                    'offers' => [
                        '@type' => 'Offer',
                        'price' => $data['rate'],
                        'priceCurrency' => 'INR',
                        'priceValidUntil' => date('Y-m-d', strtotime('+1 day', strtotime($data['date']))),
                        'availability' => 'https://schema.org/InStock'
                    ]
                ];
                
                $schema[] = $city_schema;
                
                // Add FAQPage schema for city pages
                $faq_schema = [
                    '@context' => 'https://schema.org',
                    '@type' => 'FAQPage',
                    'mainEntity' => [
                        [
                            '@type' => 'Question',
                            'name' => 'What is the current egg rate in ' . $data['city_name'] . '?',
                            'acceptedAnswer' => [
                                '@type' => 'Answer',
                                'text' => 'The current egg rate in ' . $data['city_name'] . ' is ₹' . $data['rate'] . ' per 100 eggs as of ' . date('F j, Y', strtotime($data['date'])) . '.'
                            ]
                        ],
                        [
                            '@type' => 'Question',
                            'name' => 'How often are egg rates updated in ' . $data['city_name'] . '?',
                            'acceptedAnswer' => [
                                '@type' => 'Answer',
                                'text' => 'Egg rates in ' . $data['city_name'] . ' are updated daily based on the wholesale market prices and NECC rates.'
                            ]
                        ]
                    ]
                ];
                
                $schema[] = $faq_schema;
            }
            break;
            
        case 'state':
            if (!empty($data['state_name'])) {
                // Add organization schema with location for state pages
                $state_schema = [
                    '@context' => 'https://schema.org',
                    '@type' => 'Organization',
                    'name' => 'Egg Producers in ' . $data['state_name'],
                    'description' => 'Information about egg rates and poultry markets in ' . $data['state_name'] . ', India.',
                    'address' => [
                        '@type' => 'PostalAddress',
                        'addressRegion' => $data['state_name'],
                        'addressCountry' => 'IN'
                    ]
                ];
                
                $schema[] = $state_schema;
                
                // Add FAQ for state pages
                if (!empty($data['avg_rate'])) {
                    $faq_schema = [
                        '@context' => 'https://schema.org',
                        '@type' => 'FAQPage',
                        'mainEntity' => [
                            [
                                '@type' => 'Question',
                                'name' => 'What is the average egg rate in ' . $data['state_name'] . '?',
                                'acceptedAnswer' => [
                                    '@type' => 'Answer',
                                    'text' => 'The average egg rate in ' . $data['state_name'] . ' is ₹' . $data['avg_rate'] . ' per 100 eggs. Rates may vary by city and district.'
                                ]
                            ]
                        ]
                    ];
                    
                    $schema[] = $faq_schema;
                }
            }
            break;
            
        case 'home':
            // Add breadcrumb for homepage
            $breadcrumb_schema = [
                '@context' => 'https://schema.org',
                '@type' => 'BreadcrumbList',
                'itemListElement' => [
                    [
                        '@type' => 'ListItem',
                        'position' => 1,
                        'name' => 'Home',
                        'item' => 'https://todayeggrates.com/'
                    ]
                ]
            ];
            
            $schema[] = $breadcrumb_schema;
            
            // Add article for homepage
            $article_schema = [
                '@context' => 'https://schema.org',
                '@type' => 'Article',
                'headline' => 'Today\'s Egg Rates Across India',
                'description' => 'Get the latest egg prices from major cities across India. Updated daily with wholesale and retail egg rates from NECC and local markets.',
                'datePublished' => date('Y-m-d'),
                'dateModified' => date('Y-m-d'),
                'publisher' => [
                    '@type' => 'Organization',
                    'name' => 'Today Egg Rates',
                    'logo' => [
                        '@type' => 'ImageObject',
                        'url' => 'https://todayeggrates.com/eggpic.png'
                    ]
                ]
            ];
            
            $schema[] = $article_schema;
            break;
    }
    
    return '<script type="application/ld+json">' . json_encode($schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>';
}

/**
 * Generates schema markup specifically for blog posts
 * @param array $data Blog post data
 * @return string The JSON-LD schema markup
 */
function generate_blog_schema($data) {
    $schema = [];
    
    // Article schema
    $article_schema = [
        '@context' => 'https://schema.org',
        '@type' => 'BlogPosting',
        'headline' => $data['title'],
        'description' => $data['description'],
        'image' => 'https://todayeggrates.com' . $data['image'],
        'datePublished' => date('c', strtotime($data['date_published'])),
        'dateModified' => date('c', strtotime($data['date_modified'])),
        'author' => [
            '@type' => 'Person',
            'name' => !empty($data['author']) ? $data['author'] : 'Today Egg Rates Team'
        ],
        'publisher' => [
            '@type' => 'Organization',
            'name' => 'Today Egg Rates',
            'logo' => [
                '@type' => 'ImageObject',
                'url' => 'https://todayeggrates.com/tee.png'
            ]
        ],
        'mainEntityOfPage' => [
            '@type' => 'WebPage',
            '@id' => 'https://todayeggrates.com/blog/' . basename($data['image'], '.jpg')
        ]
    ];
    
    $schema[] = $article_schema;
    
    // Add FAQ schema if FAQs are provided
    if (!empty($data['faqs']) && is_array($data['faqs'])) {
        $faq_items = [];
        
        foreach ($data['faqs'] as $faq) {
            $faq_items[] = [
                '@type' => 'Question',
                'name' => $faq['question'],
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $faq['answer']
                ]
            ];
        }
        
        if (!empty($faq_items)) {
            $faq_schema = [
                '@context' => 'https://schema.org',
                '@type' => 'FAQPage',
                'mainEntity' => $faq_items
            ];
            
            $schema[] = $faq_schema;
        }
    }
    
    // Add breadcrumb schema
    $breadcrumb_schema = [
        '@context' => 'https://schema.org',
        '@type' => 'BreadcrumbList',
        'itemListElement' => [
            [
                '@type' => 'ListItem',
                'position' => 1,
                'name' => 'Home',
                'item' => 'https://todayeggrates.com/'
            ],
            [
                '@type' => 'ListItem',
                'position' => 2,
                'name' => 'Blog',
                'item' => 'https://todayeggrates.com/blog/'
            ],
            [
                '@type' => 'ListItem',
                'position' => 3,
                'name' => $data['title'],
                'item' => 'https://todayeggrates.com/blog/' . basename($data['image'], '.jpg')
            ]
        ]
    ];
    
    $schema[] = $breadcrumb_schema;
    
    return '<script type="application/ld+json">' . json_encode($schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>';
}

/**
 * Generates schema markup specifically for special egg rate pages
 * @param array $data Special egg rate data
 * @return string The JSON-LD schema markup
 */
function generate_special_rate_schema($data) {
    $schema = [];
    
    // Website schema (included on all pages)
    $website_schema = [
        '@context' => 'https://schema.org',
        '@type' => 'WebSite',
        'name' => 'Today Egg Rates',
        'url' => 'https://todayeggrates.com/',
        'potentialAction' => [
            '@type' => 'SearchAction',
            'target' => 'https://todayeggrates.com/search?q={search_term_string}',
            'query-input' => 'required name=search_term_string'
        ]
    ];
    
    $schema[] = $website_schema;
    
    // Product schema for egg type
    $product_schema = [
        '@context' => 'https://schema.org',
        '@type' => 'Product',
        'name' => ucfirst($data['egg_type']) . ' Eggs',
        'description' => $data['description'],
        'offers' => [
            '@type' => 'AggregateOffer',
            'priceCurrency' => 'INR',
            'lowPrice' => number_format($data['avg_rate'] * 0.85, 2),
            'highPrice' => number_format($data['avg_rate'] * 1.15, 2),
            'offerCount' => '100+',
            'priceValidUntil' => date('Y-m-d', strtotime('+1 day')),
            'availability' => 'https://schema.org/InStock'
        ]
    ];
    
    $schema[] = $product_schema;
    
    // Article schema
    $article_schema = [
        '@context' => 'https://schema.org',
        '@type' => 'Article',
        'headline' => $data['title'],
        'description' => $data['description'],
        'image' => 'https://todayeggrates.com/eggpic.png',
        'datePublished' => date('c'),
        'dateModified' => date('c'),
        'author' => [
            '@type' => 'Organization',
            'name' => 'Today Egg Rates'
        ],
        'publisher' => [
            '@type' => 'Organization',
            'name' => 'Today Egg Rates',
            'logo' => [
                '@type' => 'ImageObject',
                'url' => 'https://todayeggrates.com/tee.png'
            ]
        ],
        'mainEntityOfPage' => [
            '@type' => 'WebPage',
            '@id' => 'https://todayeggrates.com/' . $data['egg_type'] . '-egg-rates'
        ]
    ];
    
    $schema[] = $article_schema;
    
    // FAQ Schema
    $faq_schema = [
        '@context' => 'https://schema.org',
        '@type' => 'FAQPage',
        'mainEntity' => [
            [
                '@type' => 'Question',
                'name' => 'What is the current average ' . $data['egg_type'] . ' egg rate in India?',
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => 'The current average ' . $data['egg_type'] . ' egg rate in India is ₹' . $data['avg_rate'] . ' as of ' . date('F j, Y', strtotime($data['date'])) . '. Rates vary by city and state based on local market conditions.'
                ]
            ],
            [
                '@type' => 'Question',
                'name' => 'Why do ' . $data['egg_type'] . ' egg rates fluctuate?',
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => ucfirst($data['egg_type']) . ' egg rates fluctuate due to changes in feed costs, seasonal demand variations, production volumes, and market conditions. Prices typically rise during winter months and festival seasons when demand increases.'
                ]
            ],
            [
                '@type' => 'Question',
                'name' => 'How often are the ' . $data['egg_type'] . ' egg rates updated?',
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => 'The ' . $data['egg_type'] . ' egg rates on TodayEggRates.com are updated daily based on data from the National Egg Coordination Committee (NECC) and major poultry markets across India.'
                ]
            ]
        ]
    ];
    
    // Add type-specific questions
    if ($data['egg_type'] == 'wholesale') {
        $faq_schema['mainEntity'][] = [
            '@type' => 'Question',
            'name' => 'What is the minimum quantity for wholesale egg purchases?',
            'acceptedAnswer' => [
                '@type' => 'Answer',
                'text' => 'Wholesale egg purchases typically start from 100 eggs (1 crate) and go up to thousands of eggs. Larger quantities often qualify for additional discounts. The rates listed are generally for purchases of 100 eggs or more.'
            ]
        ];
    } elseif ($data['egg_type'] == 'retail') {
        $faq_schema['mainEntity'][] = [
            '@type' => 'Question',
            'name' => 'Why are retail egg prices higher than wholesale prices?',
            'acceptedAnswer' => [
                '@type' => 'Answer',
                'text' => 'Retail egg prices include the wholesaler\'s margin, the retailer\'s profit margin, transportation costs, storage costs, and sometimes packaging expenses. These additional costs typically add 10-15% to the wholesale price.'
            ]
        ];
    } elseif ($data['egg_type'] == 'farm') {
        $faq_schema['mainEntity'][] = [
            '@type' => 'Question',
            'name' => 'How can I buy eggs directly from farms?',
            'acceptedAnswer' => [
                '@type' => 'Answer',
                'text' => 'To buy eggs directly from farms, you can visit local poultry farms, check farmers\' markets, or contact farm cooperatives in your area. Some farms also offer delivery services for bulk orders. Direct purchases often result in fresher eggs at better prices.'
            ]
        ];
    } elseif ($data['egg_type'] == 'desi') {
        $faq_schema['mainEntity'][] = [
            '@type' => 'Question',
            'name' => 'What\'s the difference between desi eggs and regular eggs?',
            'acceptedAnswer' => [
                '@type' => 'Answer',
                'text' => 'Desi eggs come from indigenous chicken breeds that are often free-range or raised in more natural conditions. They typically have a deeper yellow/orange yolk, stronger shell, and are believed to contain higher levels of omega-3 fatty acids and vitamins compared to regular white eggs from commercial layer hens.'
            ]
        ];
    }
    
    $schema[] = $faq_schema;
    
    // Breadcrumb schema
    $breadcrumb_schema = [
        '@context' => 'https://schema.org',
        '@type' => 'BreadcrumbList',
        'itemListElement' => [
            [
                '@type' => 'ListItem',
                'position' => 1,
                'name' => 'Home',
                'item' => 'https://todayeggrates.com/'
            ],
            [
                '@type' => 'ListItem',
                'position' => 2,
                'name' => ucfirst($data['egg_type']) . ' Egg Rates',
                'item' => 'https://todayeggrates.com/' . $data['egg_type'] . '-egg-rates'
            ]
        ]
    ];
    
    $schema[] = $breadcrumb_schema;
    
    return '<script type="application/ld+json">' . json_encode($schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>';
}