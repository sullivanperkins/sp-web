<?php

// =============================================================================
// FUNCTIONS/GLOBAL/ADMIN/WIDGETS.PHP
// -----------------------------------------------------------------------------
// Sets up the default widget areas for X.
// =============================================================================

// =============================================================================
// TABLE OF CONTENTS
// -----------------------------------------------------------------------------
//   01. Widget Area Count
//   02. Register Widget Areas
// =============================================================================

// Widget Area Count
// =============================================================================

if ( ! function_exists( 'x_header_widget_areas_count' ) ) :
  function x_header_widget_areas_count() {

    return x_get_option( 'x_header_widget_areas', '2' );

  }
endif;

if ( ! function_exists( 'x_footer_widget_areas_count' ) ) :
  function x_footer_widget_areas_count() {

    return x_get_option( 'x_footer_widget_areas', '3' );

  }
endif;



// Register Widget Areas
// =============================================================================

//
// 1. Default sidebar.
// 2. Widgetbar.
// 3. Footer.
//

if ( ! function_exists( 'x_widgets_init' ) ) :
  function x_widgets_init() {

    //
    // Default.
    //

    register_sidebar( array(
      'name'          => __( 'Main Sidebar', '__x__' ),
      'id'            => 'sidebar-main',
      'description'   => __( 'Appears on posts and pages that include the sidebar.', '__x__' ),
      'before_widget' => '<div id="%1$s" class="widget %2$s">',
      'after_widget'  => '</div>',
      'before_title'  => '<h4 class="h-widget">',
      'after_title'   => '</h4>',
    ) );


    //
    // Widgetbar.
    //

    $i = 0;
    while ( $i < 4 ) : $i++;
      register_sidebar( array( // 2
        'name'          => __( 'Header ', '__x__' ) . $i,
        'id'            => 'header-' . $i,
        'description'   => __( 'Widgetized header area.', '__x__' ),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h4 class="h-widget">',
        'after_title'   => '</h4>',
      ) );
    endwhile;

    //
    // Home Page Widgets
    //
    
     register_sidebar( array(
      'name'          => __( 'Home Page Links 1', '__x__' ),
      'id'            => 'home-page-links-1',
      'description'   => __( 'Appears on Homepage Blue Column.', '__x__' ),
      'before_widget' => '<div id="%1$s" class="widget %2$s">',
      'after_widget'  => '</div>',
      'before_title'  => '<h4 class="h-widget">',
      'after_title'   => '</h4>',
    ) );
     register_sidebar( array(
      'name'          => __( 'Home Page Links2', '__x__' ),
      'id'            => 'home-page-links-2',
      'description'   => __( 'Appears on Homepage Red Column.', '__x__' ),
      'before_widget' => '<div id="%1$s" class="widget %2$s">',
      'after_widget'  => '</div>',
      'before_title'  => '<h4 class="h-widget">',
      'after_title'   => '</h4>',
    ) );


    //
    // Footer top
    //
    
     register_sidebar( array(
      'name'          => __( 'Top Footer 1', '__x__' ),
      'id'            => 'footer-top-1',
      'description'   => __( 'Appears on the top of footer.', '__x__' ),
      'before_widget' => '<div id="%1$s" class="widget %2$s">',
      'after_widget'  => '</div>',
      'before_title'  => '<h4 class="h-widget">',
      'after_title'   => '</h4>',
    ) );
     register_sidebar( array(
      'name'          => __( 'Top Footer 2', '__x__' ),
      'id'            => 'footer-top-2',
      'description'   => __( 'Appears on the top of footer.', '__x__' ),
      'before_widget' => '<div id="%1$s" class="widget %2$s">',
      'after_widget'  => '</div>',
      'before_title'  => '<h4 class="h-widget">',
      'after_title'   => '</h4>',
    ) );
     register_sidebar( array(
      'name'          => __( 'Top Footer 3', '__x__' ),
      'id'            => 'footer-top-3',
      'description'   => __( 'Appears on the top of footer.', '__x__' ),
      'before_widget' => '<div id="%1$s" class="widget %2$s">',
      'after_widget'  => '</div>',
      'before_title'  => '<h4 class="h-widget">',
      'after_title'   => '</h4>',
    ) );
     register_sidebar( array(
      'name'          => __( 'Top Footer 4', '__x__' ),
      'id'            => 'footer-top-4',
      'description'   => __( 'Appears on the top of footer.', '__x__' ),
      'before_widget' => '<div id="%1$s" class="widget %2$s">',
      'after_widget'  => '</div>',
      'before_title'  => '<h4 class="h-widget">',
      'after_title'   => '</h4>',
    ) );
     register_sidebar( array(
      'name'          => __( 'Top Footer 5', '__x__' ),
      'id'            => 'footer-top-5',
      'description'   => __( 'Appears on the top of footer.', '__x__' ),
      'before_widget' => '<div id="%1$s" class="widget %2$s">',
      'after_widget'  => '</div>',
      'before_title'  => '<h4 class="h-widget">',
      'after_title'   => '</h4>',
    ) );
    



    //
    // Footer.
    //

    $i = 0;
    while ( $i < 5 ) : $i++;
      register_sidebar( array( // 3
        'name'          => __( 'Footer ', '__x__' ) . $i,
        'id'            => 'footer-' . $i,
        'description'   => __( 'Widgetized footer area.', '__x__' ),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h4 class="h-widget">',
        'after_title'   => '</h4>',
      ) );
    endwhile;

  }
  add_action( 'widgets_init', 'x_widgets_init' );
endif;