<?php

// =============================================================================
// VIEWS/GLOBAL/_FOOTER-WIDGET-AREAS.PHP
// -----------------------------------------------------------------------------
// Outputs the widget areas for the footer.
// =============================================================================

$n = x_footer_widget_areas_count();

?>


<footer class="x-colophon top" role="contentinfo">





  <div class="x-container max width top-footer">
    
    <div class="x-column x-md x-1-5">
      <?php
      if(is_active_sidebar('footer-top-1')){
      dynamic_sidebar('footer-top-1');
      }
      ?>
    </div>

    <div class="x-column x-md x-1-5">
      <?php
      if(is_active_sidebar('footer-top-2')){
      dynamic_sidebar('footer-top-2');
      }
      ?>
    </div>

    <div class="x-column x-md x-1-5">
      <?php
      if(is_active_sidebar('footer-top-3')){
      dynamic_sidebar('footer-top-3');
      }
      ?>
    </div>
    <div class="x-column x-md x-1-5">
      <?php
      if(is_active_sidebar('footer-top-4')){
      dynamic_sidebar('footer-top-4');
      }
      ?>
    </div>
    <div class="x-column x-md x-1-5">
      

      <?php
      if(is_active_sidebar('footer-top-5')){
      dynamic_sidebar('footer-top-5');
      }
      ?>
    </div>
    
  </div>

<div class="x-container max width mid-footer">
  <div class="x-column x-md x-1-1">
    <h4 class="h-widget">Counties and Cities We Serve</h4>
  </div>
</div>






<?php if ( $n != 0 ) : ?>

  
    <div class="x-container max width">

      <?php


      $i = 0; while ( $i < $n ) : $i++;

        $last = ( $i == $n ) ? ' last' : '';



        echo '<div class="x-column x-md x-1-' . $n . $last . '">';
          dynamic_sidebar( 'footer-' . $i );
        echo '</div>';

      endwhile;

      ?>

    </div>
 

<?php endif; ?>

 </footer>