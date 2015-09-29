<header class="banner" role="banner">
  <div class="container">
    <div class="row">
      <div class="col-md-12 brand">
        <a href="<?= esc_url(home_url('/')); ?>"><?php bloginfo('name'); ?></a>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <nav class="navbar navbar-default" role="navigation">
           <div class="navbar-header">
              <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
                 <span class="sr-only">Toggle navigation</span>
                 <span class="icon-bar"></span>
                 <span class="icon-bar"></span>
                 <span class="icon-bar"></span>
              </button>
           </div>

           <div class="collapse navbar-collapse  navbar-ex1-collapse">
            <?php
            if (has_nav_menu('primary_navigation')) :
              wp_nav_menu(['theme_location' => 'primary_navigation', 'menu_class' => 'nav navbar-nav']);
            endif;
            ?>
          </div>
        </nav>
      </div>
    </div>
  </div>
</header>
